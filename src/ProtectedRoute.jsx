// 로그인한 사용자만 접근할 수 있도록 보호하는 라우트 컴포넌트
// username이 없으면 로그인하지 않은 상태로 간주하고 로그인 페이지로 이동시킴

import { useUser } from "./UserContext";           // context에서 사용자 상태를 불러옴
import { Navigate } from "react-router-dom";       // 페이지 이동에 사용되는 컴포넌트임

// children - 이 컴포넌트로 감싼 실제 페이지 컴포넌트
export default function ProtectedRoute({ children }) {
  const { username } = useUser(); // 현재 로그인한 사용자의 이름 가져옴

  // 로그인하지 않은 경우 -> username이 없으면
  // 로그인 페이지("/")로 강제로 이동시킴
  if (!username) return <Navigate to="/" replace />;

  // 로그인된 상태면 원래 요청한 페이지(children)를 그대로 보여줌
  return children;
}
