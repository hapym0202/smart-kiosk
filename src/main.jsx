// 앱의 진입점이 되는 파일
// public/index.html에 있는 <div id="root">에 React 앱을 붙여줌
// 여기서 테마 설정(MUI)과 전역 스타일(css)도 같이 적용해줌

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';           // App 컴포넌트를 가져옴 (전체 페이지 구성 파일임)
import './index.css';                  // 전역 스타일 불러옴 (Tailwind 설정 + 커스텀 폰트 등 포함됨)

// MUI(Material UI)에서 사용할 테마 관련 함수들 참조
import { ThemeProvider, createTheme } from '@mui/material/styles';

// createTheme 함수를 이용해서 커스텀 테마를 생성
// 전체 앱에 적용할 기본 글꼴을 'TheJamsil5Bold'로 설정
const theme = createTheme({
  typography: {
    fontFamily: 'TheJamsil5Bold, sans-serif',
  },
});

// React 앱을 루트 DOM에 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 전체 앱에 테마 적용 */}
    <ThemeProvider theme={theme}>
      <App /> {/* App 컴포넌트가 실행되면서 라우팅, 상태관리 등 전체 구동 */}
    </ThemeProvider>
  </React.StrictMode>
);
