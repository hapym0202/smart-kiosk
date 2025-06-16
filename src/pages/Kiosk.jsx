// 키오스크 메인 화면 컴포넌트
// 민원 신청, 민원 조회, AI 상담 버튼을 통해 각 기능으로 이동
// 화면 오른쪽 아래에서는 관리자 로그인

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../UserContext";

export default function Kiosk() {
  const navigate = useNavigate();
  const { setIsAdmin } = useUser(); // 관리자 여부를 설정할 수 있는 함수 불러옴

  const [showAdminPrompt, setShowAdminPrompt] = useState(false); // 관리자 비밀번호 입력창 열려있는지 여부
  const [adminPassword, setAdminPassword] = useState("");        // 입력한 관리자 비밀번호 저장용

  // AI 상담 버튼을 눌렀을 때 실행되는 함수
  const handleChatbot = () => {
    // AI 상담 화면으로 이동
    setTimeout(() => navigate("/chatbot"));
  };

  // 관리자 인증 처리 함수임
  // 비밀번호가 맞으면 관리자 페이지로 이동함
  const handleAdminAccess = () => {
    if (adminPassword === "0000") {   //현재 관리자 비밀번호 0000
      setIsAdmin(true);    // 관리자 권한 true로 설정함
      navigate("/admin");  // 관리자 페이지로 이동시킴
    } else {
      alert("비밀번호가 틀렸습니다."); // 틀리면 알림창 띄움
    }
  };

  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance("키오스크 화면입니다.");
    utterance.lang = "ko-KR";
    utterance.rate = 1.2;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }, []);

  return (
    <div className="h-screen w-screen bg-white flex flex-col overflow-hidden px-8">
      {/* 메인 버튼 영역: 화면 세로 중앙 정렬됨 */}
      <div className="pt-28 pb-24 flex-1">
        <div className="grid grid-cols-3 gap-8 max-w-screen-xl mx-auto px-4 h-full">

          {/* 민원 신청 버튼 */}
          <button
            onClick={() => navigate("/apply")}
            className="square-button w-full h-full"
            style={{
              backgroundColor: "#cc0d00",     // 빨간색 배경
              borderColor: "#ffffff"          // 흰색 테두리
            }}
          >
            민원 신청
          </button>

          {/* 내 민원 조회 버튼 */}
          <button
            onClick={() => navigate("/my-complaints")}
            className="square-button w-full h-full"
            style={{
              backgroundColor: "#0026ff",     // 파란색 배경
              borderColor: "#ffffff"
            }}
          >
            내 민원 조회
          </button>

          {/* AI 상담원 버튼 */}
          <button
            onClick={handleChatbot}
            className="square-button w-full h-full"
            style={{
              backgroundColor: "#2ca102",     // 초록색 배경
              borderColor: "#ffffff"
            }}
          >
            AI 상담원
          </button>
        </div>
      </div>

      {/* 하단 오른쪽 구석에 있는 관리자 진입 링크 */}
      <div className="absolute bottom-4 right-6 text-xs text-black">
        {/* 아직 입력창 안 열린 상태면 링크만 보여줌 */}
        {!showAdminPrompt ? (
          <button onClick={() => setShowAdminPrompt(true)}>
            관리자 민원 관리
          </button>
        ) : (
          // 입력창이 열린 경우: 비밀번호 입력 필드 + 확인 버튼 보여줌
          <div className="mt-2 space-y-1 text-right">
            <input
              type="password"
              className="border text-sm w-28"
              placeholder="PW" // 힌트 텍스트
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)} // 비밀번호 상태로 저장
            />
            <button
              onClick={handleAdminAccess}
              className="bg-black text-white text-xs hover:bg-gray-800"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
