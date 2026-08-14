import SERVER_URL from "./env.js";
const userInput = document.querySelector("#userInput");
const titleInput = document.querySelector("#titleInput");
const postButton = document.querySelector("#post-button");
async function onClickPostButton(){
    const postData = {
        title:titleInput.value,
        content:userInput.value
    }
    console.log(postData)
    try {
        const response = await fetch(`${SERVER_URL}api/v1/posts`,{
        method:"POST",
        headers: {
        'Content-Type': 'application/json',
        },
        credentials:"include",
        body:JSON.stringify(postData)
    })
    const result = await response.json();
    console.log(result)
    if(result.success === true){
        alert(result.message)
        window.location.href = 'main.html';
    }else{
        alert(result.message)
    }}catch(error){
        console.error("통신에러",error)
    }
}
const userName = document.querySelector(".user p");
userName.innerHTML=localStorage.getItem("isLogin")
postButton.addEventListener("click",onClickPostButton);