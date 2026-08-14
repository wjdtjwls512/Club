import SERVER_URL from "./env.js";
// 로그인 폼과 입력 요소 가져오기
const loginForm = document.querySelector('.form');
const usernameInput = loginForm.querySelector('input[placeholder="username"]');
const passwordInput = loginForm.querySelector('input[placeholder="password"]');
localStorage.setItem("isLogin","notLogin")
const accessToken = "accessToken"
// 서버 주소
// 로그인 버튼 클릭 시 실행
loginForm.addEventListener('submit', async (event) => {
  // 새로고침 방지
  event.preventDefault();

  // 입력값 가져오기
  const usernameValue = usernameInput.value;
  const passwordValue = passwordInput.value;

  // API 명세에 맞게 데이터 생성
  const loginData = {
    username: usernameValue,
    password: passwordValue,
  };

  try {
    // 임시 서버에서 로그인 결과 요청
    const response = await fetch(`${SERVER_URL}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body:JSON.stringify(loginData)
    });

    // 응답 데이터 변환
    const result = await response.json();

    // 로그인 성공 시
    if (result.success === true) {
      alert(result.message);
      localStorage.setItem("isLogin",usernameValue);
      window.location.href = 'main.html';
    } else {
      alert('로그인에 실패했습니다. 아이디와 비밀번호를 확인해 주세요.');
      localStorage.setItem("isLogin","notLogin");
    }
  } catch (error) {
    // 서버 연결 실패
    console.error('통신 에러 발생:', error);
    alert('임시 서버가 켜져 있는지 확인해 주세요.');
  }
});
