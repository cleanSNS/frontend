//가운데에 띄우는 화면
import Style from './detailPage.module.css';
import moreStuff from './moreStuff.png';
import heartImg from './heart_outline.png';
import heartImgFill from './heart_fill.png';
import newCommentImg from './tagImages/message.png';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import {
    LoadDetailPageUrl,

} from './../../../apiUrl';
import axios from 'axios';

const RenderCommentOfComment = ({commentId, refreshAccessToken}) => {
    let CommentofCommentstartId = 987654321;
    return (
        <div className={Style.CommentBox} style={{width:"80%"}}>
                                <div className={Style.CommentProfileArea}>
                                    <img className={Style.UserImage} />
                                    <p className={Style.UserNickname}>아아아아아아아아아아아아아아</p>
                                    <img src={moreStuff} className={Style.UserSetting} />
                                </div>
                                <p className={Style.commentText}>대댓글 내용이 오는 공간입니다.ㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇㅇ</p>
                                <div className={Style.commentbtnArea}>
                                    <img src={heartImg} className={Style.buttonImg} />
                                    <p className={Style.likeandCommentCount}>좋아요111개</p>
                                    <img src={newCommentImg} className={Style.buttonImg} />
                                    <p className={Style.likeandCommentCount}>답글 더보기</p>
                                </div>
                            </div>

    );
}

const RenderComment = ({pageId, refreshAccessToken}) => {
    const [commentList, setCommentList] = useState([
        {
            "userDto": {
                "userId": 1,
                "nickname": "홍길동",
                "imgUrl": null
            },
            "commentId": 1,
            "content": "first comment",
            "likeCount": 0,
            "createdDate": "2022-08-04T23:45:55.11111"
        },
        {
            "userDto": {
                "userId": 1,
                "nickname": "홍길동",
                "imgUrl": null
            },
            "commentId": 5,
            "content": "first comment",
            "likeCount": 0,
            "createdDate": "2022-08-04T23:45:55.55555"
        }
    ]); //업로드된 댓글
    let CommentstartId = 987654321;
    const [lastComment, inView] = useInView();

    //초기 화면 로드 - 댓글
    const presetComment = () => {
        if(pageId === -1) return;
        axios.get(LoadDetailPageUrl + pageId.toString() + "/comment?startId=" + CommentstartId.toString())
        .then((res) => {
            const tmp = [...res.data.data];
            const current = [...commentList];
            const next = tmp.concat(current);
            setCommentList(next);
            CommentstartId = res.data.startId;
        })
        .catch((res) => {
            if(res.status === 401){
                refreshAccessToken();
            }
            else{
                console.log(res);
                alert("댓글을 불러오지 못했습니다.");
            }
        });
    };
    useEffect(presetComment, []);

    return(
        <div className={Style.CommentArea}>
            {
            commentList.map((data, index) => (
                <div key={index} className={Style.singleCommentArea} ref={index === (commentList.length - 1) ? {lastComment} : null}>
                    <div className={Style.CommentBox} style={{width:"100%"}}>
                            <div className={Style.CommentProfileArea}>
                                <img src={data.userDto.imgUrl} className={Style.UserImage} />
                                <p className={Style.UserNickname}>{data.userDto.nickname}</p>
                                <img src={moreStuff} className={Style.UserSetting} />
                            </div>
                            <p className={Style.commentText}>{data.content}</p>
                            <div className={Style.commentbtnArea}>
                                <img src={heartImg} className={Style.buttonImg} />
                                <p className={Style.likeandCommentCount}>{`좋아요 ${data.likeCount}개`}</p>
                                <img src={newCommentImg} className={Style.buttonImg} />
                                <p className={Style.likeandCommentCount}>답글 더보기</p>
                            </div>
                    </div>
                    <RenderCommentOfComment commentId={data.commentId} refreshAccessToken={refreshAccessToken}/>
                </div>
            ))
            }
        </div>
    );
};

const DetailPage = ({pageId, refreshAccessToken, setPageId}) => {//pageId가 -1이 되면 DetailPage가 사라진다.
    const [postedImageList, setPostedImageList] = useState([]);//올린 이미지 list
    const [postedPersonImage, setPostedPersonImage] = useState("");//올린 사람의 이미지
    const [postedPersonNickname, setPostedPersonNickname] = useState("");//올린 사람의 닉네임
    const [postedWord, setPostedWord] = useState(""); //올린 글의 내용
    const [likeNumber, setLikeNumber] = useState(0); //좋아요 개수
    const [postedTime, setPostedTime] = useState("");//업로드 시간(n분전같은 글로 저장

    //초기 화면 로드 - 글 내용
    const presetDetailPage = () => {
        if(pageId === -1) return;
        axios.get(LoadDetailPageUrl + pageId.toString() + "/detail")
        .then((res) => {
            setPostedImageList(res.data.data.imgUrlList);
            setPostedPersonImage(res.data.data.pageDto.userDto.imgUrl);
            setPostedPersonNickname(res.data.data.pageDto.userDto.nickname);
            setPostedWord(res.data.data.pageDto.content);
            setLikeNumber(res.data.data.pageDto.likeCount);
            const now = new Date();
            const postedTime = new Date(res.data.data.pageDto.createdDate);
            let timeCal = (now - postedTime) / 1000;//초단위로 계산
            if(timeCal < 1){//1초보다 더 빨리 이전에 올린 경우
                setPostedTime("방금전");
            }
            else{//1초 이상인 경우
                if(timeCal < 60){//1초부터 59초의 경우
                    setPostedTime((Math.floor(timeCal)).toString() + "초전");
                }
                else{//60초 이상인 경우
                    timeCal /= 60; //분단위로 계산
                    if(timeCal < 60){//1분부터 59분의 경우
                        setPostedTime((Math.floor(timeCal)).toString() + "분전");
                    }
                    else{//60분 이상인 경우
                        timeCal /= 60; //시간단위로 계산
                        if(timeCal < 24){//1시간부터 23시간의 경우
                            setPostedTime((Math.floor(timeCal)).toString() + "시간전");
                        }
                        else{//24시간이상의 경우
                            timeCal /= 24; //일단위로 계산
                            if(timeCal < 365){//1일부터 364일의 경우
                                setPostedTime((Math.floor(timeCal)).toString() + "일전");
                            }
                            else{//그 이상의 경우
                                timeCal /= 365;
                                setPostedTime((Math.floor(timeCal)).toString() + "년전");
                            }
                        }
                    }
                }
            }
        })
        .catch((res) => {
            if(res.status === 401){
                refreshAccessToken();
            }
            else{
                console.log(res);
                alert("글을 불러오지 못했습니다.");
            }
        });
    };
    useEffect(presetDetailPage, []);

    //외부 클릭 시 화면 닫기
    const closePage = (event) => {
        if(event.target.id === "outSide"){
            setPageId(-1);
        }
    }

    return(
        <div className={Style.wholeCover} onClick={closePage} id="outSide">
            <div className={Style.ImageAndScriptCover}>
                <div className={Style.imageArea}>

                </div>
                <div className={Style.ScriptArea}>
                    {/* 글 영역 */}
                    <div className={Style.pageScriptArea}>
                        <div className={Style.postPersonProfileArea}>
                            <img src={postedPersonImage} className={Style.UserImage} />
                            <p className={Style.UserNickname}>{postedPersonNickname}</p>
                            <img src={moreStuff} className={Style.UserSetting} />
                        </div>
                        <div className={Style.postPersonSettingArea}>

                        </div>
                        <div className={Style.contentArea}>
                            <p className={Style.content}>{postedWord}</p>
                        </div>
                        <div className={Style.likeTimeArea}>
                            <div className={Style.cover}>
                                <img src={heartImg} className={Style.buttonImg} />
                                <p className={Style.likeandCommentCount}>{`좋아요 ${likeNumber}개`}</p>
                            </div>
                            <p className={Style.time}>{postedTime}</p>
                        </div>
                    </div>
                    {/* 댓글 영역 */}
                    <RenderComment pageId={pageId} refreshAccessToken={refreshAccessToken}/>
                    {/* 댓글 입력 영역 */}
                    <div className={Style.userCommentArea}>
                        <div className={Style.cover}>
                            <textarea type="text" className={Style.userComment} placeholder="댓글을 입력하세요..."/>
                        </div>
                        <div className={Style.cover}>
                            <button className={Style.commentSubmitBtn}>게시</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailPage;