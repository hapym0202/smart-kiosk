// 사용자 정보를 전역으로 관리하기 위한 Context 파일
// 로그인한 사용자의 이름, 전화번호, 관리자 여부를 저장하고 다른 컴포넌트에서 꺼내 쓸 수 있게 함

import { createContext, useContext, useState } from "react";

// Context 생성함 (전역 상태 저장소처럼 사용)
const UserContext = createContext();

// <App> 같은 상위 컴포넌트를 감싸면서
// 하위 컴포넌트들이 username, phone, isAdmin 같은 값에 접근할 수 있게 함
export function UserProvider({ children }) {
  // 사용자 이름 상태
  const [username, setUsername] = useState("");      // 기본값은 빈 문자열
  // 사용자 전화번호 상태
  const [phone, setPhone] = useState("");
  // 관리자 여부 상태 (true/false)
  const [isAdmin, setIsAdmin] = useState(false);

  // Provider로 감싸면 하위 컴포넌트에서 전부 useUser로 값 사용 가능
  return (
    <UserContext.Provider
      value={{
        username,     // 사용자 이름
        setUsername,  // 이름 설정 함수
        phone,        // 전화번호
        setPhone,     // 전화번호 설정 함수
        isAdmin,      // 관리자 여부
        setIsAdmin,   // 관리자 설정 함수
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// 다른 컴포넌트에서 쉽게 전역 사용자 정보에 접근 가능
// ex.const { username } = useUser();
export function useUser() {
  return useContext(UserContext);
}
