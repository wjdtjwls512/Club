import SERVER_URL from "./env.js";

const urlParams = new URLSearchParams(window.location.search);
const POST_ID = urlParams.get('id') || "1"; 
const CURRENT_USER = "USERNAME"; 

// DOM 요소 미리 찾아두기
const mainLikeIcon = document.querySelector('#icon1 svg');
const mainLikeCount = document.querySelector('#icon1 p');
const mainCommentCount = document.querySelector('#icon2 p');
const commentInputDiv = document.getElementById('inputDiv');
const commentInput = commentInputDiv.querySelector('input');
const userName = document.querySelector(".user p");
const commentBtn = commentInputDiv.querySelector('button');
const rightInfo = document.getElementById('right-info');
const editDel = document.querySelector('#editDel');
// 1. 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', async () => {
    await loadPostData();
    await loadCommentsData();
});

// [API] 게시글 상세 조회
async function loadPostData() {
    try {
        const response = await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}`,{
            method: 'GET',
            credentials:"include"
        });
        if (!response.ok) throw new Error("글 불러오기 실패");
        
        const post = await response.json();
        console.log(post)
        document.getElementById('postTitle').innerText = post.data.title || "제목 없음";
        document.querySelector('#left-info > p').innerText = post.data.content || "내용 없음";
        userName.innerText = post.data.username;
        if (post.data.createdAt) {
            document.getElementById('postDate').innerText = formatDate(post.data.createdAt);
        }
        // 💡 [수정됨] 새로고침해도 좋아요 수와 하트 색상(liked) 유지하기
        if (post.data.likeCount !== undefined) {
            mainLikeCount.innerText = post.data.likeCount.toLocaleString();
        }
        if (post.data.commentCount !== undefined){
            mainCommentCount.innerText = post.data.commentCount.toLocaleString();
        }
        if (post.data.liked) {
            mainLikeIcon.classList.add('active-heart');
            mainLikeIcon.style.fill = 'red';
            mainLikeIcon.style.stroke = 'red';
        }
        if (post.data.isWriter){
            console.log('글쓴이');
            editDel.innerHTML=
            `<button id="editButton" data-action="edit-post">수정</button>
            <button id="delButton" data-action="delete-post">삭제</button>`
        }else{
            console.log('노글쓴이');
            editDel.innerHTML=``
        }
    } catch (error) {
        console.error("게시글 로드 실패:", error);
    }
}
// [API] 댓글 조회
async function loadCommentsData() {
    try {
        const response = await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}/comments`,{
            method:"GET",
            credentials:"include"
        });
        if (!response.ok) throw new Error("댓글 불러오기 실패");
        const comments = await response.json();
        console.log(comments)
        if (comments.data) {
            comments.data.forEach(comment => {
                appendComment(comment.writer, comment.content, comment.id, comment.isWriter,comment.liked,comment.likeCount,comment.createdAt);
            });
        }
    } catch (error) {
        console.error("댓글 서버 로드 실패:", error);
        loadMockComments(); // 실패 시 백업용
    }
}

// 2. [API] 댓글 생성
commentBtn.addEventListener('click', async () => {
    const commentText = commentInput.value.trim();
    if (!commentText) return;
    try {
        const response = await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: commentText }),
            credentials: "include"
        });
        if (response.ok) {
            const newComment = await response.json();
            // 임시로 화면에 바로 반영 (새로고침 없이)
            appendComment(CURRENT_USER, commentText, newComment.data?.id || Date.now(), true);
            commentInput.value = "";
        }
    } catch (e) {
        console.error("댓글 생성 에러:", e);
        appendComment(CURRENT_USER, commentText, "mock_" + Date.now(), true);
        commentInput.value = "";
    }
});

// 3. 댓글창 내부 이벤트 (좋아요, 수정, 삭제)
rightInfo.addEventListener('click', async (e) => {
    const target = e.target;
    const commentBox = target.closest('.Comment');
    if (!commentBox) return;
    
    const commentId = commentBox.dataset.id;

    // A. [API] 댓글 좋아요 (토글 및 실시간 숫자 반영)
    const likeBtn = target.closest('.comment-like-icon');
    if (likeBtn) {
        try {
            // 💡 [수정 포인트] 상태 상관없이 무조건 'POST'를 날려서 서버가 알아서 토글(취소)하게 만듭니다.
            const response = await fetch(`${SERVER_URL}api/v1/posts/comments/${commentId}/likes`, { 
                method: 'POST', // 백엔드 명세서 기준 토글 방식
                credentials: "include"
            });

            if (response.ok) {
                const countDiv = likeBtn.nextElementSibling;
                let currentLikes = parseInt(countDiv.innerText.replace(/,/g, '')) || 0;

                // UI 클래스 토글
                likeBtn.classList.toggle('active-heart');
                
                // 바뀐 상태에 따라 하트 색상과 숫자를 업데이트
                if (likeBtn.classList.contains('active-heart')) {
                    likeBtn.style.fill = 'red';
                    likeBtn.style.stroke = 'red';
                    countDiv.innerText = (currentLikes + 1).toLocaleString();
                } else {
                    likeBtn.style.fill = 'none';
                    likeBtn.style.stroke = 'currentColor';
                    countDiv.innerText = (currentLikes - 1).toLocaleString();
                }
            } else {
                // 🔥 만약 또 취소가 안 된다면 여기서 에러를 뿜어줄 겁니다!
                console.error("하트 취소/적용 실패! 서버 응답 코드:", response.status);
                alert(`하트 조작 실패! (에러 코드: ${response.status}) 백엔드 에러를 확인하세요.`);
            }
        } catch(error) {
            console.error("댓글 좋아요 실패:", error);
        }
        return; // 좋아요 버튼 누른 거면 뒤에 수정/삭제 로직은 안 타도록 종료
    }
    // B. [API] 댓글 삭제
    if (target.classList.contains('delete-btn')) {
        if (confirm("정말 이 댓글을 삭제할 거야?")) {
            try {
                await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}/comments/${commentId}`, {
                    method: 'DELETE',
                    credentials: "include"
                });
                commentBox.remove(); 
            } catch(error) {
                console.error("삭제 에러:", error);
                commentBox.remove(); // 에러나도 시연을 위해 지움
            }
        }
    }

    // C. [API] 댓글 수정
    if (target.classList.contains('edit-btn')) {
        const pTag = commentBox.querySelector('.comment-text');
        const currentText = pTag.innerText;
        
        const newText = prompt("댓글을 수정해봐:", currentText);
        if (newText && newText.trim() !== "") {
            try {
                await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}/comments/${commentId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include",
                    body: JSON.stringify({ content: newText.trim() })
                });
                pTag.innerText = newText.trim();
            } catch(error) {
                console.error("수정 에러:", error);
                pTag.innerText = newText.trim();
            }
        }
    }
});
editDel.addEventListener("click", (event) => {
    const actionButton = event.target.closest?.("button[data-action]");
    if (!actionButton) return;

    if (actionButton.dataset.action === "edit-post") {
        tryEditData();
    }
    if (actionButton.dataset.action === "delete-post") {
        removePostData();
    }
    if (actionButton.dataset.action === "complete-edit") {
        editData();
    }
});
async function removePostData() {
    try{
        const response = await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}`,{
            method:'DELETE',
            credentials:"include"
        })
        if(response.ok){
            const result = await response.json()
            if(result.success){
            alert('삭제완료')
            window.location.href = 'main.html'; 
            }else{
                console.log(result.message)
            }
        }else{
            console.log('값안옴')
        }
        
    }catch(error){
        console.error("에러:",error)
    }
}
async function editData() {
    if(!document.querySelector('#postTitle input').value || !document.querySelector('#left-info > p textarea').value){
        alert('제목과 내용을 모두 채워주세요.')
        return
    }
    editDel.innerHTML=
    `<button id="editButton" data-action="edit-post">수정</button>
    <button id="delButton" data-action="delete-post">삭제</button>`
    const postData = {
        title:document.querySelector('#postTitle input').value,
        content:document.querySelector('#left-info > p textarea').value
    }
    try{
        const response = await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}`,{
            method:"PUT",
            headers: {
            'Content-Type': 'application/json',
            },
            credentials:"include",
            body:JSON.stringify(postData)
        })
        if(response.ok){
        const result=response.json();
        if(result.data.success){
            alert('수정성공')
        }else{
            console.log('오류')
        }
        }
    }catch(e){
        console.error('에러:',e)
    }
    document.querySelector('#postTitle').innerHTML = document.querySelector('#postTitle input').value;
    document.querySelector('#left-info > p').innerHTML = document.querySelector('#left-info > p textarea').value;
}
async function tryEditData(){
    editDel.innerHTML=
    `<button id="editedButton" data-action="complete-edit">수정완료</button>
    <button id="delButton" data-action="delete-post">삭제</button>` 
    document.getElementById('postTitle').innerHTML = `<input type="text" value=${document.getElementById('postTitle').innerText} placeholder="title..." id="titleInput2">`;
    document.querySelector('#left-info > p').innerHTML = `<textarea id="userInput2" placeholder="what do you want talk about?">${document.querySelector('#left-info > p').innerText}</textarea>`;
}
// 4. [API] 게시글 좋아요 (토글 방식 수정)
mainLikeIcon.addEventListener('click', async () => {
    try {
        // DELETE 없애고 POST로만 토글 (명세서 기준)
        const response = await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}`,{
            method: 'GET',
            credentials:"include"
        });
        if (!response.ok) throw new Error("글 불러오기 실패");
        const post = await response.json();
        const response2 = await fetch(`${SERVER_URL}api/v1/posts/${POST_ID}/likes`, {
            method: post.data.liked?'DELETE':'POST',
            credentials: "include"
        });

        if (response2.ok) {
            mainLikeIcon.classList.toggle('active-heart');
            let currentLikes = parseInt(mainLikeCount.innerText.replace(/,/g, '')) || 0;

            if (mainLikeIcon.classList.contains('active-heart')) {
                mainLikeIcon.style.fill = 'red';
                mainLikeIcon.style.stroke = 'red';
                mainLikeCount.innerText = (currentLikes + 1).toLocaleString();
            } else {
                mainLikeIcon.style.fill = 'none';
                mainLikeIcon.style.stroke = 'currentColor';
                mainLikeCount.innerText = (currentLikes - 1).toLocaleString();
            }
        }
    } catch(error) {
        console.error("게시글 좋아요 에러:", error);
    }
});
function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) return '';

    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
// 🛠️ 댓글 DOM 생성기 (SVG 클래스 이름 수정됨)
async function appendComment(user, text, id,isMyComment,liked,likeCount,createdAt = null) {
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('Comment');
    const likeClass = liked?'active-heart':''
    console.log(likeClass)
    const dateText = createdAt ? formatDate(createdAt) : '';
    commentDiv.dataset.id = id;
    const actionButtons = isMyComment 
        ? `<div class="comment-actions" style="font-size:12px; color:gray; margin-left:35px; margin-top:-5px; margin-bottom:10px;">
            <span class="edit-btn" style="cursor:pointer; margin-right:10px;">수정</span>
            <span class="delete-btn" style="cursor:pointer; color:red;">삭제</span>
           </div>`
        : '';

    commentDiv.innerHTML = `
        <div class="comment">
            <div class="mini-user">
                <img src="images/profile.svg" class="mini-pika-img">
                <p>${user}</p>
                <span class="comment-date">${dateText}</span>
            </div>
            <div class='commentHeartWrap'>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="left-info-icon comment-like-icon ${likeClass}" style="cursor:pointer;${liked?"fill:red;stroke:red;":""}">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                <div>
                ${likeCount}
                </div>
            </div>
        </div>
        <p class="comment-text" style="margin: 10px 0 5px 35px;">${text}</p>
        ${actionButtons}
    `;
    
    rightInfo.insertBefore(commentDiv, commentInputDiv);
}
