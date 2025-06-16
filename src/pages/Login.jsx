// 로그인 화면 컴포넌트
// 사용자가 이름과 전화번호를 입력하면 인증번호(SMS)를 전송
// 현재는 무료 버전이라 테스트용만 가능
// 테스트 전화번호: +82 10-1111-2222(01011112222로 입력하면 됨)
// 이름만 바꾸고 전화번호만 그대로 사용
// 인증번호: 123456
// 2025년 8월 25일까지만 사용가능
// 인증번호까지 입력해서 성공하면 로그인 처리 후 키오스크 메인으로 이동함

import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";

export default function Login() {
  // 입력값 상태 관리
  const [name, setName] = useState("");               // 사용자 이름
  const [phoneInput, setPhoneInput] = useState("");   // 전화번호 입력값
  const [code, setCode] = useState("");               // 인증번호 입력값
  const [confirmationResult, setConfirmationResult] = useState(null); // Firebase에서 받은 인증 세션 객체
  const [message, setMessage] = useState("");         // 안내 메시지 또는 오류 메시지

  // 사용자 전역 상태 업데이트 함수(로그인 처리에 사용됨)
  const { setUsername, setPhone: setGlobalPhone, setIsAdmin } = useUser();
  const navigate = useNavigate(); // 페이지 이동용 훅

  // 페이지 진입 시 음성으로 "로그인 페이지입니다" 라고 안내함
  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance("로그인 페이지입니다.");
    utterance.lang = "ko-KR";
    utterance.rate = 1.2;
    speechSynthesis.cancel(); // 이전 음성이 남아있을 수 있으니 끊어줌
    speechSynthesis.speak(utterance);
  }, []);

  // 인증번호 전송 함수
  const sendCode = async () => {
    // 전화번호 형식을 정리함: 010-1234-5678 → +821012345678 형태로 바꿈
    const cleaned = phoneInput.replace(/[-\s]/g, "").replace(/^0/, "");
    const formatted = "+82" + cleaned;

    // 이름 또는 전화번호 형식이 이상할 경우 경고 메시지 띄움
    if (!name || !formatted.match(/^\+82\d{9,11}$/)) {
      setMessage("이름과 전화번호 형식을 확인해주세요.");
      return;
    }

    try {
      // reCAPTCHA 객체를 invisible 모드로 생성함 (필수임, 사용자한텐 안 보임)
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible"
      });

      // Firebase에 전화번호 인증 요청 → 사용자에게 문자로 인증코드 전송됨
      const result = await signInWithPhoneNumber(auth, formatted, window.recaptchaVerifier);
      setConfirmationResult(result); // 받은 세션을 상태로 저장함
      setMessage("인증번호를 전송했습니다."); // 안내 메시지 보여줌
    } catch (error) {
      console.error(error);
      setMessage("인증번호 전송 실패: 형식을 확인해주세요.");
    }
  };

  // 인증번호 확인 함수
  const verifyCode = async () => {
    const cleaned = phoneInput.replace(/[-\s]/g, "").replace(/^0/, "");
    const formatted = "+82" + cleaned;

    try {
      // 입력한 인증번호가 올바른지 확인함
      await confirmationResult.confirm(code); // 인증 성공 시 여기서 에러 안 남

      // 인증 성공했으므로 사용자 정보를 전역 상태에 저장함
      setUsername(name);
      setGlobalPhone(formatted);
      setIsAdmin(false); // 일반 사용자로 로그인함

      // 민원 키오스크 메인 페이지로 이동시킴
      navigate("/kiosk");
    } catch (error) {
      console.error(error);
      setMessage("인증번호가 올바르지 않습니다."); // 실패 시 안내
    }
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col justify-center items-center px-4 overflow-hidden">
      <h1 className="text-2xl font-bold mb-6">스마트 키오스크 로그인</h1>

      {/* 로그인 입력 박스 영역 */}
      <div className="bg-white p-6 rounded-lg shadow-none w-full max-w-sm space-y-4">
        {/* 이름 입력 */}
        <div>
          <label className="block mb-1 font-medium">이름</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* 전화번호 입력 */}
        <div>
          <label className="block mb-1 font-medium">전화번호</label>
          <input
            type="tel"
            className="w-full p-2 border rounded"
            placeholder="예: 01012345678"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
          />
        </div>

        {/* 인증 */}
        {!confirmationResult ? (
          // 아직 인증번호 요청 전 상태
          <button
            onClick={sendCode}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            인증번호 전송
          </button>
        ) : (
          // 인증번호를 보냈으면 입력창 + 확인 버튼 보여줌
          <>
            <input
              type="text"
              placeholder="인증번호 입력"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={verifyCode}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              인증 완료
            </button>
          </>
        )}

        {/* 안내 메시지 또는 에러 메시지 표시 */}
        {message && <p className="text-sm text-red-600">{message}</p>}
      </div>

      {/* Firebase reCAPTCHA가 여기에 삽입됨 (invisible 모드라 안 보임) */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
