import axios from 'axios';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from "./routes/Home/root/HomeMain";
import Login from "./routes/Login/root/LoginMain";
import { logoutApiUrl, KakaoTokenUrl, NaverTokenUrl, refreshNewAccessTokenUrl, getNoticeNumber, getMyUserIdUrl } from './apiUrl';
axios.defaults.withCredentials = true;

function App() {
  //로그인시 refresh token을 local Storage에 저장하는 기능 앞에 Bearer 가 붙어있다.
  const loginFunc = (res) => {
    console.log(res);//로그인의 응답
    localStorage.setItem("rft", res.headers.authorization);//rft설정

    let userId = "";

    axios.get(getMyUserIdUrl)
    .then((res) => {
      userId = res.data.data.userId;
      console.log(res.data.data.userId);
    })
    .catch((res) => {
      if(res.status === 401){
        refreshAccessToken();
      }
      else{
        console.log("유저 아이디를 불러오지 못했습니다.");
      }
    });

    const eventSource = new EventSource(`${getNoticeNumber}/${userId}`, { withCredentials: true });
    console.log(eventSource);
    const tmp = JSON.stringify(eventSource);
    console.log(tmp)
    localStorage.setItem("eventSourceObject", JSON.stringify(eventSource));

    //window.location.href="/main";
  };

  //Access token이 만료되었을 수 있는 상황에서 refresh Token을 통해 다시 발급받는다.
  const refreshAccessToken = () => {
    axios.get(refreshNewAccessTokenUrl, {
      headers:{
        "REFRESH-TOKEN": localStorage.getItem("rft")
      }
    })
    .then((res) => {
      console.log("토큰 재발급");
      //reDoApiCall();
    })
    .catch((res) =>{
      console.log(res);
      alert("장시간 로그인되어, 자동 로그아웃되었습니다. 다시 로그인해주세요.");
      //logoutFunc(); //정상작동 확인되면 앞 주석 지우기
    })
  };

  //로그아웃 함수
  const logoutFunc = () => {
    axios.get(logoutApiUrl)
    .then((res) => {
      console.log(res);
      alert("logout success");
      localStorage.removeItem("rft");//refresh token 지우기
      window.location.href="/";
    })
    .catch((res)=>{
      console.log("error")
      console.log(res);
    });
  };

  //카카오 로그인 시 토큰을 프론트로 받게 되는 경우 처리하는 함수
  const socialLogin = () => {
    if(localStorage.getItem("rft") === "kakao"){//소셜 처리중인 경우
      const params = new URL(window.location.href).searchParams;
      const code = params.get("code");
      console.log(code);
      axios.post(KakaoTokenUrl + code)
      .then((res) => {//문제가 없는 경우이므로, 로그인 해준다.
        console.log(res);
        loginFunc(res);
      })
      .catch((res) => {
        console.log(res);
        alert("소셜 로그인에 문제가 발생했습니다.");
        localStorage.removeItem("rft");//소셜 상태를 종료한다.
        window.location.href = "/";//다시 원래의 로그인 url로 이동한다.
      });
    }
    else if(localStorage.getItem("rft") === "naver"){//소셜 처리중인 경우
      const params = new URL(window.location.href).searchParams;
      const code = params.get("code");
      console.log(code);
      axios.post(NaverTokenUrl + code)
      .then((res) => {//문제가 없는 경우이므로, 로그인 해준다.
        console.log(res);
        loginFunc(res);
      })
      .catch((res) => {
        console.log(res);
        alert("소셜 로그인에 문제가 발생했습니다.");
        localStorage.removeItem("rft");//소셜 상태를 종료한다.
        window.location.href = "/";//다시 원래의 로그인 url로 이동한다.
      });
    }
  };
  useEffect(socialLogin, []);

  return (
    <Router>
      {/*localStorage.getItem("rft") === null ? <Redirect to='/' /> : null*/}
      {/*localStorage.getItem("rft") !== "social" && localStorage.getItem("rft") !== null ?
        <Redirect to="/main" /> : null 
      */}
      <Switch>
        <Route path="/main">
          <Home logout={logoutFunc} refreshAccessToken={refreshAccessToken}/>
        </Route>
        <Route path="/">
          <Login login={loginFunc}/>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;