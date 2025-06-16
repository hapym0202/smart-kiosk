// 인공지능 상담원 페이지 컴포넌트임
// 사용자가 질문을 직접 입력하거나 마이크 버튼을 눌러 말하면 GPT API를 통해 답변을 받아서 화면에 보여주고 음성으로도 읽어줌

import { useState, useEffect, useRef } from "react";
import { fetchGPTReply } from "../api/gpt"; // GPT 응답 받아오는 함수 불러옴

export default function Chatbot() {
  const [messages, setMessages] = useState([]);     // 전체 대화 내용 저장
  const [input, setInput] = useState("");           // 사용자가 입력 중인 텍스트 상태
  const [loading, setLoading] = useState(false);    // GPT 답변 대기 중일 때 true로 바뀜
  const bottomRef = useRef(null);                   // 맨 아래로 스크롤하기 위한 ref임

  // 자주 묻는 질문 리스트
  const faqList = [
    "주민등록등본 발급 방법",
    "민원 처리 기간은 얼마나 걸리나요?",
    "인터넷으로 신청 가능한 민원은?",
    "가족관계증명서 온라인 발급",
  ];

  // 새로운 메시지가 생길 때마다 스크롤을 자동으로 아래로 내려줌
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 여러 문장을 순서대로 읽어주는 함수. GPT 답변을 음성으로 안내
  const speakQueue = (texts) => {
    if (!Array.isArray(texts)) texts = [texts]; // 문자열이면 배열로 바꿔줌
    const play = (i) => {
      if (i >= texts.length) return; // 마지막 문장까지 다 읽었으면 끝냄
      const u = new SpeechSynthesisUtterance(texts[i]); // 읽을 문장 하나 생성함
      u.lang = "ko-KR";
      u.rate = 1.3; // 말 속도 빠르게 설정
      u.onend = () => play(i + 1); // 다 읽으면 다음 문장 읽게 함
      speechSynthesis.cancel(); // 혹시 이전 읽기 중단
      speechSynthesis.speak(u); // 읽기 시작
    };
    play(0); // 첫 문장부터 시작
  };

  // 마이크 버튼을 눌렀을 때 실행 -> 음성 인식 시작
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("브라우저가 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // 음성 인식이 끝나면 결과를 input으로 설정하고 바로 전송함
    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript.trim();
      setInput(voiceText); // 화면에 표시
      setTimeout(() => handleSend(voiceText), 300); // 바로 GPT에게 보냄
    };

    recognition.start(); // 음성 인식 시작
  };

  // 질문을 보냈을 때 실행되는 함수 (전송 버튼이나 enter키, 마이크로 호출)
  const handleSend = async (customInput) => {
    const message = customInput || input; // 직접 보낸 값이 없으면 input에서 가져옴
    if (!message.trim()) return; // 아무 것도 없으면 무시

    // 사용자 메시지를 messages에 추가함
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput(""); // 입력창 비움
    setLoading(true); // 로딩 상태로 변경

    try {
      const reply = await fetchGPTReply(message); // GPT에게 질문 보내고 응답 받음
      setMessages((prev) => [...prev, { role: "bot", text: reply }]); // 응답 추가
      speakQueue(reply); // 음성으로 읽어줌
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "오류가 발생했습니다." }]);
    } finally {
      setLoading(false); // 로딩 상태 해제
    }
  };

  // 페이지가 처음 열릴 때 실행 -> 인사 메시지 출력 + 음성 안내
  useEffect(() => {
    const welcome = "안녕하세요. 인공지능 상담원입니다. 무엇을 도와드릴까요?";
    setMessages([{ role: "bot", text: welcome }]); // 대화 시작 메시지
    speakQueue([welcome]); // 음성 안내 재생
  }, []);

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center pt-24 px-4">
      {/* 채팅 전체 영역 */}
      <div className="w-full max-w-4xl flex-1 bg-[#f4f4f9] rounded-lg shadow p-4 overflow-y-auto">

        {/* 자주 묻는 질문 버튼들 */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {faqList.map((faq, i) => (
            <button
              key={i}
              onClick={() => handleSend(faq)} // 버튼 클릭 시 질문 전송
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              {faq}
            </button>
          ))}
        </div>

        {/* 대화 메시지들 렌더링 */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex mb-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && (
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white text-sm flex items-center justify-center mr-2">
                <i className="fa-solid fa-headset text-xl"></i>
              </div>
            )}
            <div
              className={`px-4 py-3 rounded-xl max-w-[70%] whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-500 text-white ml-2" : "bg-gray-200 text-black mr-2"
                }`}
            >
              {/* 여러 줄일 경우 줄바꿈 처리 */}
              {msg.text.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            {msg.role === "user" && (
              <div className="w-10 h-10 rounded-full bg-gray-400 text-white text-sm flex items-center justify-center ml-2">
                <i className="fa-solid fa-user text-xl"></i>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
        {/* 로딩 중일 때 표시되는 문구 */}
        {loading && <div className="text-sm text-gray-500">답변 생성 중...</div>}
      </div>

      {/* 입력창 + 전송/음성 버튼 영역 */}
      <div className="w-full max-w-3xl m-4 flex gap-2">
        <input
          type="text"
          className="flex-1 p-4 border rounded-lg text-lg"
          placeholder="상담 내용을 입력하세요..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend(); // 엔터로 질문 전송
            }
          }}
        />
        <button
          onClick={() => handleSend()}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 text-lg"
        >
          전송
        </button>
        <button
          onClick={handleVoiceInput}
          className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 text-lg"
        >
          <i className="fa-solid fa-microphone text-2xl"></i>
        </button>
      </div>
    </div>
  );
}
