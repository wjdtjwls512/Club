import SERVER_URL from "./env.js";
const headerUserInfo = document.querySelector("#headerUserInfo");
const moreUserInfo = document.querySelector("#moreUserInfo");
const moreUserInfoName = document.querySelector("#moreUserInfoName");
moreUserInfo.id = "moreUserInfo";
const header = document.querySelector("header");
const logOutButton = document.querySelector("#logOutButton");
let profileToggle = false;
function clickProfile(){
    profileToggle?profileToggle=false:profileToggle=true;
    if(profileToggle){
        moreUserInfo.className = "visible"
    }else{
        moreUserInfo.className = "inVisible";

    }
}
async function logOut(){
    console.log("로그아웃")
    const response = await fetch(`${SERVER_URL}auth/logout`,{
        method:"POST",
        credentials: 'include',
    });
    localStorage.setItem('isLogin','notLogin');
    window.location.href = 'main.html';
}
if(localStorage.getItem("isLogin")!=="notLogin" || !localStorage.getItem("isLogin")){
    headerUserInfo.innerHTML=`<img src="images/profile.svg" id="profileButton" alt="프로필">`;
    moreUserInfoName.innerHTML = localStorage.getItem("isLogin");
}else{
    headerUserInfo.innerHTML=`
    <a href="login.html">Log in</a>
    <a href="signup.html">Sign up</a>`;
}

const profileButton = document.querySelector("#profileButton");
const writeButton = document.querySelector("#writeButton");

profileButton?.addEventListener("click", clickProfile);
logOutButton?.addEventListener("click", (event) => {
  event.preventDefault();
  logOut();
});
writeButton?.addEventListener("click", (event) => {
  event.preventDefault();
  onClickWrite();
});

async function refreshToken() {
  try {
    const response = await fetch(`${SERVER_URL}auth/refresh`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json', 
      },
      credentials: 'include' 
    });
    const result = await response.json();
    console.log("리프레시 결과:", result);
    if (result.success === true) {
      console.log("토큰 재발급 성공");
      return;
    } else {
      console.log("리프레시 실패");
      localStorage.setItem("isLogin","notLogin");
      return;
    }
  } catch (error) {
    console.error("리프레시 토큰 통신에러:", error);
    localStorage.setItem("isLogin","notLogin");
    return;
  }
}
function onClickWrite(){
  if(localStorage.getItem("isLogin")!=="notLogin" || !localStorage.getItem("isLogin")){
    window.location.href = 'create.html';
  }else{
    alert("로그인후 이용가능합니다.")
  }
}

setInterval(refreshToken,1000*60*10)
