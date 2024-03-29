import { useState, useEffect } from 'react';
import Style from "./HomeMain.module.css";
import Logo from "../../../logo/Logo";
import SearchBar from "./searchBar/searchBar";
import NumberNotice from "./numberNotice/numberNotice";
import DetailPage from './detailPage/detailPage';

import LeftPage from "../leftInner/page/page";
import LeftPageList from "../leftInner/pageList/pageList";
import LeftChat from "../leftInner/chat/chat";
import LeftNewPost from "../leftInner/newPost/newPost";
import LeftSetting from "../leftInner/setting/settingMain";
import LeftNewChat from "../leftInner/newChat/newChat";
import LeftHashtagPage from "../leftInner/hashtagPage/hashtagPage";

import RightNewPost from "../rightInner/newPost/newPost";
import RightChat from "../rightInner/chat/chat";
import RightNotice from "../rightInner/notice/notice";
import RightFriend from "../rightInner/friend/friend";
import RightSetting from "../rightInner/setting/setting";

import addTagImg from "./tagImages/add.png";
import messageTagImg from "./tagImages/message.png";
import notificationTagImg from "./tagImages/notification.png";
import settingTagImg from "./tagImages/settings.png";
import userTagImg from "./tagImages/user.png";

import {
  newPostUrl,
  presetNoticeNumeber,
  uploadImageUrl,
  getChatTriger,
  presetChatNumber,
} from "../../../apiUrl";
import { getAxios, postAxios } from '../../../apiCall';

const Home = ({ logout, refreshAccessToken, noticeEventSource, userId }) => {
  /*******************************************************************new Post 관련****************************************************************************/
  /* 좌, 우 페이지로 나뉘어져있는 정보를 추합해서 서버에 보내야 하기 때문에 상위 요소에서 작성 */
  //아래는 좌측 페이지로 이동할 정보
  const [newPostImages, setNewPostImages] = useState([]);//이미지 리스트 - 파일을 api에 보낼 수 있게 처리한 리스트이다.
  const [renderedNewPostImages, setRenderedNewPostImages] = useState([]);//이미지 리스트 - 파일을 임시로 미리보기를 하기 위해 만든 리스트이다.
  const [newPostHashtag, setNewPostHashtag] = useState([]);//해시태그 리스트
  const [newPostContent, setNewPostContent] = useState("");//글

  //아래는 우측 페이지로 이동할 정보
  const [newPostLikeNotice, setNewPostLikeNotice] = useState(true);//좋아요 알림
  const [newPostCommentNotice, setNewPostCommentNotice] = useState(true);//댓글 알림
  const [newPostReadPostAuth, setNewPostReadPostAuth] = useState("ALL");//읽기 권한
  const [newPostCommentAuth, setNewPostCommentAuth] = useState(true);//댓글 관련 권한
  const [newPostReadLikeAuth, setNewPostReadLikeAuth] = useState(true);//좋아요 읽기 권한

  //글 올리는 함수 => 좌측 페이지로 넘어가야한다. - 두가지가 순차적으로 실행
  const [uploadImages, setUploadImages] = useState([]);//실제로 업로드 될 이미지의 리스트
  const [newPageSumbitClicked, setNewPageSubmitClicked] = useState(false);

  const submitAbleAgain = () => {//제출 버튼 재활성화 함수
    setNewPageSubmitClicked(false);
    const btn = document.querySelector('#newPageSubmitBtn');
    btn.innerHTML = 'Submit';
    btn.style.color = 'white';
    btn.style.backgroundColor = '#F4DEDE';
    btn.style.cursor = 'pointer';
    btn.disabled = false;
  };

  const uploadNewPostHandler = (event) => {//제출 버튼 클릭 시 실행
    event.preventDefault();
    if(newPageSumbitClicked) return;//이미 실행중인 경우 종료
    if(newPostImages.length === 0){
      alert("이미지를 하나 이상 업로드 해주세요.");
      return;
    }
    if(newPostContent.length === 0){
      alert("글을 입력해 주세요/.");
      return;
    }

    setNewPageSubmitClicked(true);
    const btn = document.querySelector('#newPageSubmitBtn');
    btn.innerHTML = "제출중";
    btn.style.color = 'black';
    btn.style.backgroundColor = 'gray';
    btn.style.cursor = 'wait';
    btn.disabled = true;
  };

  const uploadNewPostHandlerSecondAct = async () => {//트리거 되어, 2번째로 실행 => 이미지를 처리 한다.
    if(!newPageSumbitClicked) return;
    //formData에 파일들 append하기 - 파일명은 image_파일명 으로 생성
    const fileData = new FormData();
    for(let i = 0; i < newPostImages.length; i++){
      fileData.append(`file`, newPostImages[i]);
    }

    const res = await postAxios(`${uploadImageUrl}page`, fileData, {
      headers:{
        'Content-Type': 'multipart/form-data',
      }
    }, refreshAccessToken);
    const tmp = [...res.data]
    setUploadImages(tmp);
  };
  useEffect(() => {uploadNewPostHandlerSecondAct();}, [newPageSumbitClicked]);

  const uploadNewPostHandlerThirdAct = async () => {//트리거 되어, 3번째로 실행 => 글을 업로드 한다.
    if(uploadImages.length !== 0){//이미지 처리에 성공해서 렌더링할 파일이 있는 경우
      const sendBody = {
        content: newPostContent,
        pageSetting : {
          notificationLike: newPostLikeNotice,
          notificationComment: newPostCommentNotice,
          readAuth: newPostReadPostAuth,
          commentAuth: newPostCommentAuth,
          likeReadAuth: newPostReadLikeAuth,
        },
        imgUrlList: uploadImages,
        pageHashtagList: newPostHashtag,
      };
      await postAxios(newPostUrl, sendBody, {}, refreshAccessToken);
      alert("업로드 되었습니다.");
      setNewPostImages([]);
      setNewPostHashtag([]);
      setRenderedNewPostImages([]);
      setNewPostContent("");
      setNewPostLikeNotice(true);
      setNewPostCommentNotice(true);
      setNewPostReadPostAuth("ALL");
      setNewPostCommentAuth(true);
      setNewPostReadLikeAuth(true);
      resetPage();
      submitAbleAgain();
    }
  };
  useEffect(() => {uploadNewPostHandlerThirdAct();}, [uploadImages]);
  /*****************************************************************메인 페이지 기본 설정***********************************************************************************/
  //오른쪽 책의 내용을 바꿔주는 state => newPost // chat // notice // friend // setting
  const [rightBookState, setRightBookState] = useState("friend");
  //왼쪽 책의 내용을 바꿔주는 state => page(글) // pList // chat // newPost // setting // makeNewC // hastTagPage
  const [leftBookState, setLeftBookState] = useState("page");
  //setting의 내용을 바꿔주는 state => initial(클릭 없음) // profile // Snotice // password // filtering // block
  const [settingState, setSettingState] = useState("initial");

  const [pageId, setPageId] = useState(-1);//detail page를 위한 pageId state. -1인 경우, 비활성화 되고, 그 외의 값의 경우 해당 page를 불러오며, detailpage를 띄운다.

  //초기에 진행하는 함수 초기값 설정은 여기서 진행한다.
  useEffect(() => {
    firstRender();
    presetNoticeCount();
  }, []);

  //화면을 초기 상태로 만드는 함수
  const resetPage = () => {
    setRightBookState("friend");
    setLeftBookState("page");
    setSettingState("initial");
    setPageId(-1);
  };

  //채팅, 알림, 친구의 경우 이 함수를 사용해야 좌측이 달라진다.
  const leftBookChangeHandler = (val) => {
    setLeftBookState(val);
  };

  //setting 변경 함수
  const SettingChangeHandler = (val) => {
    setSettingState(val);
  };

  //친구 tag를 클릭 상태로 CSS변경 - 초기설정을 위해 필요
  const firstRender = () => {
    document.querySelector("#friend").style.backgroundColor = "rgb(145, 145, 145)";
  };

  //우측 태그 클릭 hander
  const tagClickHandler = (event) =>{
    event.preventDefault();
    const targetID = event.target.id;//누른 위치
    if(targetID === rightBookState) return; //같은 태그를 여러번 누르는 경우 아무 변화도 주지 않는다.

    if(targetID === "setting" || targetID === 'newPost'){
      setRightBookState(targetID);
      setLeftBookState(targetID);
    }
    else{
      if(leftBookState === 'setting' || leftBookState === 'newPost') setLeftBookState("page");
      setRightBookState(targetID);
    }

    if(settingState !== 'initial'){//다른 태그 클릭 시 설정을 다시 원래대로 돌린다.
      setSettingState('initial');
    }
  };

  //태그 색상 변경
  const tagColorChangeHandler = () => {
    document.querySelector("#newPost").style.backgroundColor = "rgb(190, 190, 190)";
    document.querySelector("#chat").style.backgroundColor = "rgb(190, 190, 190)";
    document.querySelector("#notice").style.backgroundColor = "rgb(190, 190, 190)";
    document.querySelector("#friend").style.backgroundColor = "rgb(190, 190, 190)";
    document.querySelector("#setting").style.backgroundColor = "rgb(190, 190, 190)";
    document.querySelector(`#${rightBookState}`).style.backgroundColor = "rgb(145, 145, 145)";//원래 눌려있던 버튼 밝게 변경
  };
  useEffect(tagColorChangeHandler, [rightBookState]);

  /***************************************************************뒤로가기, 앞으로 가기 등 처리함수************************************************************************/
  const [goBack, setGoBack] = useState(false);//뒤로가기 이벤트로 이동한 경우, true로 세팅된다.
  window.onpopstate = function(event) {//뒤로가기 이벤트를 캐치합니다.
    if(event.state === null) return;
    setRightBookState(event.state.rightBookState);
    setLeftBookState(event.state.leftBookState);
    setGoBack(true);
  };

  const pushStateHandler = () => {//state에 변경이 있을 때마다 state에 집어넣기
    if(goBack){
      setGoBack(false);
      return;
    }
    window.history.pushState({
      rightBookState: rightBookState,
      leftBookState: leftBookState,
    },null, '');
  };
  useEffect(pushStateHandler, [rightBookState, leftBookState]);

  /***************************************************************************알림 관련*****************************************************************************/
  const [noticeCount, setNoticeCount] = useState(-1);
  const [chatCount, setChatCount] = useState(-1);

  //처음 로그인 시 알림의 수를 받아오는 함수 - 초기 상태에서만 실행된다.
  const presetNoticeCount = async () => {
    if(noticeCount === -1){
      const res = await getAxios(presetNoticeNumeber, {}, refreshAccessToken);
      setNoticeCount(res.data.data.count);
    }
    if(chatCount === -1){
      const res = await getAxios(presetChatNumber, {}, refreshAccessToken);
      setChatCount(res.data.data.count);
    }
  };

  //SSE이벤트 오픈 - notice와 chat의 초기값을 불러온 이후부터는 SSE로 그 값을 업데이트한다.
  useEffect(() => {
    if(noticeEventSource === null) return;
    noticeEventSource.addEventListener("sse", function (event) {
      const data = JSON.parse(event.data);
      if(data.notificationCount !== undefined){//명시되어있는 경우만 변경
        setNoticeCount(data.notificationCount);
      }
      if(data.chatCount !== undefined){//명시되어있는 경우만 변경
        setChatCount(data.chatCount);
      }
    });
  }, [noticeCount]);

  /**********************************************************************채팅 관련************************************************************************/
  const [stompClient, setStompClient] = useState(null);//소켓 연결이 된 친구
  const [chattingRoomId, setChattingRoomId] = useState(-1);//채팅방의 id

  useEffect(() => {
    if(!leftBookState.includes('chat')){//leftBookState가 변경되었는데 그 값에 chat이 없는 경우, stompClient를 disconnect하는 작업이 필요하다.
      if(stompClient !== null){//이전에 할당받은 친구가 있었던 경우 disconnect하고 지금 생성한 Stomp를 넣어준다.
        stompClient.unsubscribe(`/sub/${chattingRoomId}`);
        stompClient.disconnect();
      }
    }
  }, [leftBookState]);

  const [chattingTrigerEventSource, setChattingTrigerEventSource] = useState(null);//채팅 관련된 SSE가 들어있는 곳
  const [chattingTriger, setChattingTriger] = useState(false);//이 변수가 이제 오른쪽 채팅에 들어가서 이게 true면 
  useEffect(() => {//상황을 인지해서 eventSource 이벤트 생성
    if(chattingTrigerEventSource === null && rightBookState === "chat"){//초기 상황이거나, 내가 지금 chatting으로 들어온 경우
      const eventSourcetmp = new EventSource(getChatTriger, { withCredentials: true });
      eventSourcetmp.addEventListener("sse", function (event) {
        const data = JSON.parse(event.data);
        setChattingTriger(true);
      });
      setChattingTrigerEventSource(eventSourcetmp);
    }
  }, [rightBookState]);

  useEffect(() => {//다른 곳으로 이동하면 없애기
    if(chattingTrigerEventSource !== null && rightBookState !== "chat"){//채팅방 부분을 벗어난 경우, 하지만 여전히 연결되어있는 경우
      chattingTrigerEventSource.close();
      setChattingTrigerEventSource(null);
      return;
    }
  }, [rightBookState]);

  /************************************************************다른 페이지들간의 트리거 변수****************************************************************************/
  //좌측 채팅방에서 로드가 되지 않은 상태에서 우측에서 채팅방 클릭 시 에러발생 - 이를 막기 위한 연결 변수
  //먼저, right의 chat에서 클릭 시, 이 값을 true로 만든다. 이후, leftchat에서 로드가 끝나면 이 값을 false로 만든다.
  //동시에 right에서 chat을 클릭할 때, 이 값이 false인지 확인해야한다.
  //채팅방에 연결되지 않은 상태에서 바뀌는 것을 막기 위함
  const [chatLoading, setChatLoading] = useState(false);

  //detailpage에서 좋아요 클릭 시 일반 pagelist에 반영하기 위해 trigger가 되는 값 - detailpage에서 좋아요를 누른 글의 id가 변수의 값이 된다.
  //detailpage에서 변경 시 leftBookState가 page인지 확인하고 누르기
  //단, page에 띄워져있는 리스트에 해당 글이 없는 경우도 존재할 수 있으니 고려해야한다.
  const [detailPageLikeClick, setDetailPageLikeClick] = useState(-1);

  //프로필 설정과 오른쪽의 friend와 chat의 연결
  const [chatAndFriendReloadTriger, setChatAndFriendReloadTriger] = useState(false);

  //개인 페이지(좌)와 friend페이지(우)의 연결
  const [userPageAndFriendReloadTriger, setUserPageAndFriendReloadTriger] = useState(false);

  return(
    <div className={Style.pageCover}>
      {/* 좌 상단 - 로고와 검색창 */}
      <div className={Style.Cover}>
        <div className={Style.leftHeader}>
          <Logo preset={resetPage}/>
          <div />
          <SearchBar setLeftBookState={setLeftBookState} refreshAccessToken={refreshAccessToken} />
        </div>
      </div>
      {/* 우 상단 - 태그 */}
      <div className={Style.Cover}>
        <div className={Style.tagArea}>
          <div className={Style.Cover}>
            <div className={Style.tag} id="newPost">
              <div className={Style.Cover}>
                <img src={addTagImg} className={Style.tagImg} onClick={tagClickHandler} id="newPost"/>
              </div>
            </div>
          </div>
          <div className={Style.Cover}>
            <div className={Style.tag} id="chat">
              <div className={Style.Cover}>
                <img src={messageTagImg} className={Style.tagImg} onClick={tagClickHandler} id="chat" />
              </div>
              <div className={Style.noticeArea}>
                {chatCount === -1 || chatCount === 0 ? null : <NumberNotice number={chatCount} />}
              </div>
            </div>
          </div>
          <div className={Style.Cover}>
            <div className={Style.tag} id="notice">
              <div className={Style.Cover}>
                <img src={notificationTagImg} className={Style.tagImg} onClick={tagClickHandler} id="notice" />
              </div>
              <div className={Style.noticeArea}>
                {noticeCount === -1 || noticeCount === 0 ? null : <NumberNotice number={noticeCount} />}
              </div>
            </div>
          </div>
          <div className={Style.Cover}>
            <div className={Style.tag} id="friend">
              <div className={Style.Cover}>
                <img src={userTagImg} className={Style.tagImg} onClick={tagClickHandler} id="friend" />
              </div>
            </div>
          </div>
          <div className={Style.Cover}>
            <div className={Style.tag} id="setting">
              <div className={Style.Cover}>
                <img src={settingTagImg} className={Style.tagImg} onClick={tagClickHandler} id="setting" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 좌측 페이지 */}
      <div className={Style.Cover}>
        <div className={Style.bookCover}>
          <div className={Style.leftbook}>
            <div className={Style.Cover}>
                {leftBookState === "page" ? <LeftPage refreshAccessToken={refreshAccessToken} leftBookState={leftBookState} setPageId={setPageId} detailPageLikeClick={detailPageLikeClick} setDetailPageLikeClick={setDetailPageLikeClick} setLeftBookState={setLeftBookState}/> : null}
                {leftBookState.includes("pList") ? <LeftPageList leftBookState={leftBookState} refreshAccessToken={refreshAccessToken} leftBookChangeHandler={leftBookChangeHandler} setPageId={setPageId} userId={userId} SettingChangeHandler={SettingChangeHandler} setUserPageAndFriendReloadTriger={setUserPageAndFriendReloadTriger}/> : null}
                {leftBookState.includes("chat") ? <LeftChat chattingRoomId={chattingRoomId} setChattingRoomId={setChattingRoomId} refreshAccessToken={refreshAccessToken} leftBookState={leftBookState} setLeftBookState={setLeftBookState} userId={userId} stompClient={stompClient} setStompClient={setStompClient} setChatLoading={setChatLoading} setChattingTriger={setChattingTriger}/> : null}
                {leftBookState === "makeNewC" ? <LeftNewChat refreshAccessToken={refreshAccessToken} setLeftBookState={setLeftBookState} userId={userId} setChattingTriger={setChattingTriger} setChatLoading={setChatLoading}/> : null}
                {leftBookState.includes("hashtagPage") ? <LeftHashtagPage leftBookState={leftBookState} setPageId={setPageId} refreshAccessToken={refreshAccessToken}/> : null}
                {leftBookState === "newPost" ? <LeftNewPost renderedNewPostImages={renderedNewPostImages} setRenderedNewPostImages={setRenderedNewPostImages} newPostImages={newPostImages} setNewPostImages={setNewPostImages} newPostHashtag={newPostHashtag} setNewPostHashtag={setNewPostHashtag} newPostContent={newPostContent} setNewPostContent={setNewPostContent} uploadNewPostHandler={uploadNewPostHandler} /> : null}
                {leftBookState === "setting" ? <LeftSetting settingState={settingState} refreshAccessToken={refreshAccessToken} userId={userId} logout={logout} setChatAndFriendReloadTriger={setChatAndFriendReloadTriger} rightBookState={rightBookState}/> : null}
            </div>
          </div>
        </div>
      </div>
      {/* 우측 페이지 */}
      <div className={Style.Cover}>
      <div className={Style.bookCover}>
          <div className={Style.rightbook}>
            <div className={Style.Cover}>
              { rightBookState === "newPost" ? <RightNewPost newPostLikeNotice={newPostLikeNotice} setNewPostLikeNotice={setNewPostLikeNotice} newPostCommentNotice={newPostCommentNotice} setNewPostCommentNotice={setNewPostCommentNotice} newPostReadPostAuth={newPostReadPostAuth} setNewPostReadPostAuth={setNewPostReadPostAuth} newPostCommentAuth={newPostCommentAuth} setNewPostCommentAuth={setNewPostCommentAuth} newPostReadLikeAuth={newPostReadLikeAuth} setNewPostReadLikeAuth={setNewPostReadLikeAuth}/> :  null}
              { rightBookState === "chat" ? <RightChat refreshAccessToken={refreshAccessToken} setLeftBookState={setLeftBookState} leftBookState={leftBookState} rightBookState={rightBookState} chattingTriger={chattingTriger} setChattingTriger={setChattingTriger} chatLoading={chatLoading} setChatLoading={setChatLoading} chatAndFriendReloadTriger={chatAndFriendReloadTriger} setChatAndFriendReloadTriger={setChatAndFriendReloadTriger}/> : null}
              { rightBookState === "notice" ? <RightNotice leftBookChangeHandler={leftBookChangeHandler} refreshAccessToken={refreshAccessToken} setPageId={setPageId} noticeCount={noticeCount} setNoticeCount={setNoticeCount}/> : null}
              { rightBookState === "friend" ? <RightFriend leftBookChangeHandler={leftBookChangeHandler} userId={userId} refreshAccessToken={refreshAccessToken} chatAndFriendReloadTriger={chatAndFriendReloadTriger} setChatAndFriendReloadTriger={setChatAndFriendReloadTriger} userPageAndFriendReloadTriger={userPageAndFriendReloadTriger} setUserPageAndFriendReloadTriger={setUserPageAndFriendReloadTriger}/> : null}
              { rightBookState === "setting" ? <RightSetting settingState={settingState} SettingChangeHandler={SettingChangeHandler} logout={logout}/> : null}
            </div>
          </div>
        </div>
      </div>
      {pageId === -1 ? null : <DetailPage pageId={pageId} refreshAccessToken={refreshAccessToken} setPageId={setPageId} leftBookChangeHandler={leftBookChangeHandler} userId={userId} resetPage={resetPage} setDetailPageLikeClick={setDetailPageLikeClick} leftBookState={leftBookState}/>}
    </div>
  );
}
  
export default Home;