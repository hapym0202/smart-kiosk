// 민원 신청 페이지 컴포넌트
// 사용자가 민원 유형, 제목, 내용을 입력하면 Firebase Firestore에 저장

import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";

export default function Apply() {
  const { username, phone } = useUser(); // 현재 로그인한 사용자 이름과 전화번호 가져옴
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // 사용자 입력값을 저장하는 상태
  const [title, setTitle] = useState("");       // 민원 제목 입력값
  const [type, setType] = useState("");         // 민원 유형 선택값
  const [content, setContent] = useState("");   // 민원 내용 입력값
  const [message, setMessage] = useState("");   // 입력 누락 또는 오류 메시지 저장용

  // 선택 가능한 민원 유형들을 배열로 정의
  const categories = [
    "시설 관련",
    "불편/건의사항",
    "신청 관련",
    "만족도 의견",
    "기타 민원",
  ];

  // 페이지에 들어오자마자 음성 안내를 출력함
  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance("민원 신청 페이지입니다."); // 안내 문장 생성
    utterance.lang = "ko-KR"; // 한국어로 설정
    utterance.rate = 1.2; // 말하는 속도 약간 빠르게 설정
    speechSynthesis.cancel(); // 이전 안내가 남아있을 상황 대비해서 끊어줌
    speechSynthesis.speak(utterance); // 안내 음성 재생
  }, []);

  // 민원 제출 버튼 클릭 시 실행되는 함수
  const handleSubmit = async () => {
    // 제목, 유형, 내용이 하나라도 비어있으면 경고 메시지 띄움
    if (!title || !type || !content) {
      setMessage("모든 항목을 입력해주세요.");
      return;
    }

    try {
      // Firebase의 complaints 컬렉션에 새 문서를 추가
      await addDoc(collection(db, "complaints"), {
        name: username,       // 사용자 이름 저장
        phone,                // 사용자 전화번호 저장
        title,                // 입력한 제목 저장
        type,                 // 선택한 민원 유형 저장
        content,              // 입력한 내용 저장
        status: "미처리",     // 새 민원은 기본적으로 '미처리' 상태로 시작
        timestamp: Timestamp.now(), // 현재 시간 저장함
      });

      // 민원 제출 완료 후 "내 민원 조회" 페이지로 이동
      navigate("/my-complaints");
    } catch (error) {
      // 에러 발생 시 콘솔에 출력하고 안내 메시지 출력
      console.error(error);
      setMessage("제출 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-xl mx-auto pt-24">
      {/* 민원 유형 선택 버튼 영역 */}
      <label className="block font-medium mb-1">민원 유형</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setType(cat)} // 버튼 클릭하면 type 상태값 바뀜
            className={`px-3 py-1 rounded border ${type === cat ? "bg-blue-700 text-white" : "bg-white text-black"
              }`} // 선택된 버튼은 파란색으로 강조함
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 제목 입력창 */}
      <label className="block font-medium mb-1">제목</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)} // 입력값 상태로 저장함
        placeholder="예: 체육관 조명 고장 신고"
      />

      {/* 내용 입력창 */}
      <label className="block font-medium mb-1">내용</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={5}
        value={content}
        onChange={(e) => setContent(e.target.value)} // 입력값 상태로 저장함
        placeholder="내용을 입력하세요..."
      />

      {/* 안내 메시지 출력 영역 (에러 또는 누락 안내용) */}
      {message && <p className="text-red-500 mb-2">{message}</p>}

      {/* 민원 제출 버튼 */}
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700"
      >
        민원 제출
      </button>
    </div>
  );
}
