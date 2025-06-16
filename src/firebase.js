// Firebase 관련 모듈들을 가져오는 파일
// 이 파일 하나로 Firebase 인증(auth), 데이터베이스(firestore) 기능을 초기화해서 다른 곳에서 쉽게 쓸 수 있게 함

// Firebase 앱 초기화에 필요한 함수들 import 해줌
import { initializeApp } from "firebase/app";          // Firebase 앱 자체를 초기화하는 함수
import { getAuth } from "firebase/auth";               // 로그인/인증 관련 기능 가져옴
import { getFirestore } from "firebase/firestore";     // Firestore(문서 기반 DB) 사용을 위한 함수

// 아래는 Firebase 콘솔에서 제공하는 설정 정보임
// 이 설정값은 프로젝트마다 다르며, 콘솔에서 직접 복사해서 붙여넣으면 됨
const firebaseConfig = {
  apiKey: "AIzaSyCEaMpoAEDIHMCwZgMSaULdP0vgyRT0lZg",                 // API 키 (Firebase 서비스 사용에 필요함)
  authDomain: "smartkiosk-c61dd.firebaseapp.com",                   // 인증 도메인 (로그인 시 사용됨)
  projectId: "smartkiosk-c61dd",                                    // 이 프로젝트의 고유 ID
  storageBucket: "smartkiosk-c61dd.firebasestorage.app",           // 이미지나 파일 저장할 때 사용하는 스토리지 주소
  messagingSenderId: "643945811213",                                // 푸시 메시지 보낼 때 사용하는 ID
  appId: "1:643945811213:web:9072225ec8b99fdeedf444"                // 이 앱을 구분하는 고유 ID
};

// firebaseConfig 설정값을 이용해서 Firebase 앱을 초기화함
const app = initializeApp(firebaseConfig);

// Firebase 인증 기능 초기화 (로그인 등에서 사용)
// Firebase Firestore 기능 초기화 (민원 데이터 저장에 사용)
export const auth = getAuth(app);         // 인증 관련 객체 export해서 다른 곳에서 import해서 사용 가능하게 만듦
export const db = getFirestore(app);      // Firestore DB 객체 export해서 민원 저장/조회 등에 사용함
