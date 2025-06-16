// 내 민원 조회 페이지 컴포넌트
// 로그인한 사용자가 제출한 민원 중 본인 이름과 일치하는 항목만 필터링해서 보여줌

import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useUser } from "../UserContext";

export default function MyComplaints() {
  const { username } = useUser(); // 현재 로그인된 사용자의 이름 가져옴
  const [complaints, setComplaints] = useState([]); // 사용자 민원 리스트를 저장할 상태

  // Firebase에서 민원 데이터를 불러오고 사용자 이름과 일치하는 것만 걸러서 저장
  useEffect(() => {
    const fetchData = async () => {
      // complaints 컬렉션을 최신순(timestamp 기준)으로 가져옴
      const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q); // 문서들 불러오기
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // 문서에서 데이터 추출

      // 내 이름(username)과 일치하는 민원만 필터링
      const mine = data.filter((item) => item.name === username);
      setComplaints(mine); // 상태에 저장
    };

    fetchData(); // 함수 실행
  }, [username]); // username이 바뀌면 다시 실행됨

  // 페이지에 처음 들어왔을 때 음성 안내 출력해줌
  useEffect(() => {
    const utterance = new SpeechSynthesisUtterance("내 민원 조회 페이지입니다.");
    utterance.lang = "ko-KR";
    utterance.rate = 1.2;
    speechSynthesis.cancel(); // 혹시 이전 음성이 있으면 끊고
    speechSynthesis.speak(utterance); // 새 음성 재생함
  }, []);

  return (
    <div className="max-w-4xl mx-auto pt-24 pb-4 px-4 h-screen">
      {/* 전체 민원 목록을 보여주는 영역 */}
      <div className="h-full overflow-y-auto space-y-4 pr-2">
        <ul>
          {complaints.map((c) => (
            <li key={c.id} className="p-4 border rounded space-y-1">
              <p><strong>제목:</strong> {c.title}</p>
              <p><strong>민원 유형:</strong> {c.type}</p>
              <p><strong>내용:</strong> {c.content}</p>

              {/* 처리 상태에 따라 색상 다르게 표시해줌 */}
              <p>
                <strong>처리 상태:</strong>{" "}
                <span
                  className={
                    c.status === "미처리"
                      ? "text-red-600 font-bold"
                      : c.status === "진행중"
                        ? "text-orange-500 font-bold"
                        : "text-green-600 font-bold"
                  }
                >
                  {c.status}
                </span>
              </p>

              {/* 날짜 포맷 변환해서 보여줌 */}
              <p><strong>제출일:</strong> {c.timestamp?.toDate().toLocaleString()}</p>

              {/* 관리자 답변이 있을 경우 아래에 따로 표시 */}
              {c.reply && (
                <p className="bg-gray-100 p-2 mt-2 text-sm text-gray-800">
                  <strong>관리자 답변:</strong><br />
                  {c.reply}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
