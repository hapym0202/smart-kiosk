// 관리자용 페이지 컴포넌트
// 민원 목록을 전체 다 불러와서 볼 수 있고
// 처리 상태 바꾸거나 답변 달 수 있음

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext"; // 로그인한 사용자 정보 가져옴
import { db } from "../firebase"; // Firebase Firestore 연결

// Firestore 관련 함수
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

export default function AdminPanel() {
  const navigate = useNavigate(); // 페이지 이동용
  const { isAdmin } = useUser(); // 관리자 여부 확인

  // 상태 정의
  const [complaints, setComplaints] = useState([]);         // 전체 민원 목록 저장용
  const [search, setSearch] = useState("");                 // 이름/제목 검색어 저장
  const [filterType, setFilterType] = useState("전체");     // 민원 유형 필터링용 상태
  const [statusFilter, setStatusFilter] = useState("전체"); // 처리 상태 필터링용 상태
  const [replyDrafts, setReplyDrafts] = useState({});       // 각 민원의 답변 초안 저장

  // 첫 렌더링인지 체크함 - 기존에 관리자 페이지에서 로그아웃하면 렌더링 되면서 alert이 발생하는 문제가 있었음
  const firstRender = useRef(true);

  // 페이지 열리자마자 실행되는 부분
  useEffect(() => {
    if (!isAdmin) {
      // 관리자가 아니면 알림 띄우고 키오스크로 보냄
      if (firstRender.current) {
        alert("관리자 권한이 필요합니다.");
        navigate("/kiosk");
      }
    } else {
      // 관리자면 민원 목록 가져옴
      fetchComplaints();
    }
    firstRender.current = false;
  }, [isAdmin]);

  // 민원 목록을 Firebase에서 불러오는 함수
  const fetchComplaints = async () => {
    // complaints 컬렉션을 최신순으로 정렬해서 가져옴
    const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
    const snap = await getDocs(q); // 문서들 가져옴
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // 문서에서 데이터 꺼내서 배열로 만듦

    setComplaints(data); // 전체 민원 목록 상태로 저장
    setReplyDrafts(Object.fromEntries(data.map((c) => [c.id, c.reply || ""]))); // 답변 초안 저장 (없으면 빈 문자열로)
  };

  // 필터랑 검색어를 적용해서 보여줄 민원만 남김
  const filtered = complaints.filter(
    (c) =>
      (filterType === "전체" || c.type === filterType) &&
      (statusFilter === "전체" || c.status === statusFilter) &&
      (c.name.includes(search) || c.title.includes(search)) // 이름 또는 제목에 검색어 포함되어야 함
  );

  // 답변 저장 버튼 눌렀을 때 실행되는 함수
  const handleSave = async (id) => {
    await updateDoc(doc(db, "complaints", id), { reply: replyDrafts[id] }); // reply 필드 업데이트함
    fetchComplaints(); // 새로고침해서 화면에 반영되게 함
  };

  // 상태 변경했을 때 실행되는 함수
  const handleStatusChange = async (id, value) => {
    await updateDoc(doc(db, "complaints", id), { status: value }); // status 필드 업데이트
    fetchComplaints(); // 다시 불러와서 반영함
  };

  return (
    <div className="p-6 pt-24 h-screen flex flex-col">
      {/* 상단 필터와 검색창 영역임 */}
      <div className="flex gap-2 mb-4">
        {/* 처리 상태 선택 */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="전체" disabled hidden>처리 상태</option>
          {["전체", "미처리", "진행중", "완료"].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        {/* 이름이나 제목 검색 */}
        <input
          type="text"
          placeholder="이름/제목"
          className="border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* 민원 유형 선택 */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="전체" disabled hidden>민원 유형</option>
          {["전체", "시설 관련", "불편/건의사항", "신청 관련", "만족도 의견", "기타 민원"].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* 실제 민원 목록 테이블임 */}
      <div className="flex-1 overflow-y-auto pr-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">이름</th>
              <th className="border p-2">유형</th>
              <th className="border p-2">제목</th>
              <th className="border p-2">내용</th>
              <th className="border p-2">상태</th>
              <th className="border p-2">답변</th>
              <th className="border p-2">저장</th>
            </tr>
          </thead>
          <tbody>
            {/* 필터된 민원들 하나씩 보여줌 */}
            {filtered.map((c) => (
              <tr key={c.id}>
                <td className="border p-2">{c.name}</td>
                <td className="border p-2">{c.type}</td>
                <td className="border p-2">{c.title}</td>
                <td className="border p-2">{c.content}</td>
                <td className="border p-2">
                  {/* 상태 변경하는 드롭다운 */}
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    {["미처리", "진행중", "완료"].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="border p-2">
                  {/* 답변 쓰는 텍스트박스 */}
                  <textarea
                    rows={2}
                    className="w-full border rounded p-1 text-sm"
                    value={replyDrafts[c.id]}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                  />
                </td>
                <td className="border p-2">
                  {/* 답변 저장 버튼 */}
                  <button
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => handleSave(c.id)}
                  >
                    저장
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
