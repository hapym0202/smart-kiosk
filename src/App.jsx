// 앱 전체의 라우팅 구조를 담당하는 파일
// 페이지 상단 헤더와 각 경로별 컴포넌트를 구성

import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { UserProvider, useUser } from "./UserContext";
import Login from "./pages/Login";
import Kiosk from "./pages/Kiosk";
import Chatbot from "./pages/Chatbot";
import Apply from "./pages/Apply";
import MyComplaints from "./pages/MyComplaints";
import AdminPanel from "./pages/AdminPanel";
import ProtectedRoute from "./ProtectedRoute"; // 로그인된 사용자만 접근 가능한 라우트를 감싸주는 컴포넌트
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import LogoImg from "./assets/minwon-logo.png";

// 헤더 컴포넌트 정의 (페이지 제목, 로고, 로그아웃 버튼 등을 포함함)
function Header() {
  const { username, setUsername, setPhone, setIsAdmin } = useUser(); // 사용자 정보와 상태 설정 함수들 가져옴
  const navigate = useNavigate(); // 페이지 이동용 함수
  const { pathname } = useLocation(); // 현재 경로 가져옴

  // 이전 화면 버튼 눌렀을 때 키오스크로 돌아가게 하는 함수
  const goBackToKiosk = () => {
    const utterance = new SpeechSynthesisUtterance("키오스크 화면입니다.");
    utterance.lang = "ko-KR";
    utterance.rate = 1.3;
    speechSynthesis.cancel(); // 이전 음성 끊어줌
    speechSynthesis.speak(utterance);

    setTimeout(() => {
      navigate("/kiosk");
    });
  };

  // 로그인 화면에서는 헤더 대신 로고만 보여줌
  if (pathname === "/") {
    return (
      <header className="fixed top-0 left-0 w-full bg-white z-50 flex justify-center py-4">
        <img src={LogoImg} alt="민원 로고" className="mt-2 w-20 h-auto object-contain" />
      </header>
    );
  }

  // 페이지별 제목 정의해둠 (경로에 따라 헤더에 표시)
  const routeTitles = {
    "/": "",
    "/kiosk": "스마트 민원 키오스크",
    "/apply": "민원 신청",
    "/my-complaints": "내 민원 조회",
    "/chatbot": "인공지능 상담원 상담",
    "/admin": "관리자 민원 목록",
  };
  const title = routeTitles[pathname] || ""; // 현재 경로에 맞는 제목 가져옴

  // 로그아웃 함수: Firebase에서 로그아웃 처리 + 사용자 상태 초기화
  const handleLogout = async () => {
    await signOut(auth); // Firebase 인증 로그아웃
    setUsername("");     // 사용자 이름 초기화
    setPhone("");        // 전화번호 초기화
    setIsAdmin(false);   // 관리자 상태도 해제
    navigate("/");       // 로그인 페이지로 이동
  };

  // '← 이전 화면' 버튼을 보여줄지 결정함 (홈이나 키오스크 화면에서는 안 보임)
  const showBackButton = !["/", "/kiosk"].includes(pathname);

  return (
    <header className="fixed top-0 left-0 w-full bg-white z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 좌측: 로고 이미지 */}
        <img src={LogoImg} alt="민원 로고" className="h-10 w-10 object-contain" />

        {/* 가운데: 페이지 제목 */}
        <h2 className="text-3xl font-bold text-center mt-2 flex-grow">{title}</h2>

        {/* 우측: 사용자 이름 + 로그아웃 버튼 (로그인한 경우만) */}
        <div className="flex items-center gap-4 text-sm">
          {username && (
            <>
              <span className="text-gray-700 font-semibold">{username}님</span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:underline hover:text-red-700"
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>

      {/* ← 이전 화면 버튼: 필요한 경우만 표시됨 */}
      {showBackButton && (
        <div className="pl-4 pb-2 text-sm text-left">
          <button
            onClick={goBackToKiosk}
            className="text-sm hover:text-red-800"
          >
            ← 이전 화면
          </button>
        </div>
      )}
    </header>
  );
}

// App 컴포넌트: 전체 앱을 감싸고 라우팅과 사용자 상태를 제공해주는 역할
function App() {
  return (
    // 사용자 상태(UserContext)를 전역에서 사용할 수 있도록 감싸줌
    <UserProvider>
      <BrowserRouter>
        {/* 전체 화면 크기를 지정하고, overflow 막아 스크롤 안 생기게 설정함 */}
        <div className="w-screen h-screen overflow-hidden bg-white">
          <Header /> {/* 공통 헤더 항상 상단에 고정됨 */}
          <Routes>
            {/* 로그인 페이지 (공개됨) */}
            <Route path="/" element={<Login />} />

            {/* 아래 페이지들은 ProtectedRoute로 감싸서 인증된 사용자만 접근 가능하게 함 */}
            <Route path="/kiosk" element={<ProtectedRoute><Kiosk /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><Apply /></ProtectedRoute>} />
            <Route path="/my-complaints" element={<ProtectedRoute><MyComplaints /></ProtectedRoute>} />
            <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />

            {/* 관리자 페이지는 보호 없이 접근 가능하지만 내부에서 권한 확인함 */}
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
