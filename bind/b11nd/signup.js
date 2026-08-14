import SERVER_URL from "./env.js";
// 회원가입 폼과 입력 요소 가져오기
const signupForm = document.querySelector('.form');
const usernameInput = signupForm.querySelector('input[placeholder="username"]');
const emailInput = signupForm.querySelector('input[placeholder="email"]');
const passwordInput = signupForm.querySelector('input[placeholder="password"]');
const confirmInput = signupForm.querySelector(
  'input[placeholder="confirm password"]',
);

// 회원가입 버튼 클릭 시 실행
signupForm.addEventListener('submit', async (event) => {
  // 새로고침 방지
  event.preventDefault();

  // 입력값 가져오기
  const usernameValue = usernameInput.value;
  const emailValue = emailInput.value;
  const passwordValue = passwordInput.value;
  const confirmValue = confirmInput.value;

  // 비밀번호 형식 검사
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z0-9!@#$%^&*(),.?":{}|<>]{8,16}$/;

  if (!passwordRegex.test(passwordValue)) {
    alert('비밀번호는 8~16자의 영어와 특수문자를 무조건 포함해야 합니다');
    return;
  }

  // 비밀번호와 비밀번호 확인이 같은지 검사
  if (passwordValue !== confirmValue) {
    alert('비밀번호와 비밀번호 확인 값이 일치하지 않습니다.');
    return;
  }

  // 서버에 보낼 회원가입 데이터
  const signupData = {
    username: usernameValue,
    password: passwordValue,
    email: emailValue,
  };

  try {
    // 회원가입 요청
    const response = await fetch(`${SERVER_URL}auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    // 응답 데이터 변환
    const result = await response.json();

    // 회원가입 성공 시
    if (response.ok) {
      alert('회원가입 성공! (임시 서버 db.json에 저장 완료)');
      window.location.href = 'login.html';
    } else {
      alert('회원가입 실패: 입력 정보를 다시 확인해 주세요.');
    }
  } catch (error) {
    // 서버 연결 실패
    console.error('통신 에러 발생:', error);
    alert('임시 서버가 켜져 있는지 확인해 주세요!');
  }
});