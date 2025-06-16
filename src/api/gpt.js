// GPT에게 질문을 보내고 답변을 받아오는 함수임
// ex.fetchGPTReply("가족관계증명서는 어디서 발급하나요?")라고 호출하면 답변 문자열 반환

export async function fetchGPTReply(message) {
  // GPT API에 POST 요청을 보내기 위해 fetch 사용함
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", // 요청 방식은 POST임
    headers: {
      "Content-Type": "application/json", // 보내는 데이터는 JSON 형식임
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      // 환경변수에 저장된 OpenAI API 키를 불러와서 인증에 사용함
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // 사용할 GPT 모델은 3.5 turbo로 설정함

      // GPT는 대화형 모델이라 messages 배열로 구성함
      // 시스템 역할 메시지와 사용자 메시지를 같이 보냄
      messages: [
        {
          role: "system",
          content:
            "당신은 정부 민원 상담 키오스크의 AI 상담원입니다. 고령자나 디지털 취약 계층이 이해할 수 있도록 공손하고 짧고 쉽게 설명해주세요.",
          // 시스템 메시지는 GPT한테 성격을 부여하는 용도임
          // 여기선 키오스크 AI답게 친절하고 쉽게 말하도록 설정해줌
        },
        {
          role: "user",
          content: message, // 사용자가 입력한 질문 내용이 여기에 들어감
        },
      ],

      temperature: 0.9, 
      // 답변의 창의성 정도 조절하는 값
      // 0이면 기계적이고 1에 가까울수록 더 다양하고 자연스러워짐
    }),
  });

  // 응답을 JSON으로 파싱함
  const data = await response.json();

  // GPT가 생성한 첫 번째 답변 메시지를 꺼내서 반환함
  // 혹시 실패했을 경우엔 기본 메시지를 대신 반환함
  return data.choices?.[0]?.message?.content || "죄송합니다, 응답을 받을 수 없습니다.";
}
