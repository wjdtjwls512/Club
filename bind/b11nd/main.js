import SERVER_URL from "./env.js";
const postWrap = document.querySelector("#boxWrap");
const pagination = document.querySelector("#pagination");
async function getForumPosts(pageNumber) {
  const serverUrl = `${SERVER_URL}api/v1/posts?page=${pageNumber}`;
  try {
    const response = await fetch(serverUrl);
    if (!response.ok) {
      throw new Error(`서버 에러 발생: ${response.status}`);
    }
    const data = await response.json()
    return data;
  }catch (error) {
    console.error("데이터를 가져오는 중 오류가 발생했습니다:", error);
  }
}
function renderPosts(posts){
  console.log(posts)
  postWrap.innerHTML = '';
  posts.forEach(post => {
    const a = document.createElement('a');
    a.href=`view.html?id=${post.id}`
    a.className="box"
    a.innerHTML=`
        <div class="writerProfile">
            <img src="images/profile.svg" alt="pro">
            <p class="writerName">${post.username}</p>
        </div>
        <h5>${post.title}</h5>
        <p class="content">
            ${post.content}
        </p>
        <div class="heartAndComment">
            <div class="heart">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
              ${post.likeCount}
            </div>
            <div class="comment">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
              </svg>
              ${post.commentCount}
            </div>
          </div>
    `
    postWrap.appendChild(a);
  });
}
async function loadPage(pageNumber) {
  const data = await getForumPosts(pageNumber); 
  if (data) {
    pagination.innerHTML=""
    renderPosts(data.data.content); 
    const beforeButton = document.createElement("li");
    beforeButton.innerHTML=`<a href="#" data-page="${pageNumber-1}">«</a>`
    if (!data.data.first){
        pagination.appendChild(beforeButton)
    }
    for(let i=0;i<data.data.totalPages;i++){
        const li = document.createElement("li");
        li.innerHTML=`<a href="#" data-page="${i}">${i+1}</a>`
        if(i==pageNumber){
            li.id='nowPage';
        }
        pagination.appendChild(li)
    }
    const afterButton = document.createElement("li");
    afterButton.innerHTML=`<a href="#" data-page="${pageNumber+1}">»</a>`
    if (!data.data.last){
        pagination.appendChild(afterButton)
    }
  }
};

pagination.addEventListener("click", (event) => {
  const pageLink = event.target.closest?.("a[data-page]");
  if (!pageLink) return;

  event.preventDefault();
  const pageNumber = Number(pageLink.dataset.page);
  if (!Number.isNaN(pageNumber)) {
    loadPage(pageNumber);
  }
});

loadPage(0);
