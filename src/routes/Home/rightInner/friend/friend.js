import Style from './friend.module.css';
import Profile from '../../root/profile/profile';
import { useState, useEffect } from 'react';
import RenderRightFriend from './renderRightFriend';
import {
    getFolloweeListUrl,
    getfollowerListUrl,
    getcurrentProfileUrl,
} from '../../../../apiUrl';
import {
    getAxios
} from '../../../../apiCall';

const RightFriend = ({userId, leftBookChangeHandler, refreshAccessToken, chatAndFriendReloadTriger, setChatAndFriendReloadTriger, userPageAndFriendReloadTriger, setUserPageAndFriendReloadTriger}) => {
    const [followeeList, setFolloweeList] = useState([]);
    const [followerList, setFollowerList] = useState([]);
    const [friendList, setFriendList] = useState([]);
    const [myProfileImage, setMyProfileImage] = useState("");
    const [myProfileName, setMyProfileName] = useState("");

    const rightFriendAndUserProfileChangeHandler = async () => {//오른쪽 화면이 친구리스트인데 사용자가 프로필을 수정하는 경우, 사용자의 프로필을 다시 불러와서 갱신하는 함수
        if(!chatAndFriendReloadTriger) return;
        
        const res = await getAxios(getcurrentProfileUrl, {}, refreshAccessToken);//내 정보 불러오기
        setMyProfileName(res.data.data.nickname);
        setMyProfileImage(res.data.data.imgUrl);
        setChatAndFriendReloadTriger(false);
    };
    useEffect(() => {rightFriendAndUserProfileChangeHandler();}, [chatAndFriendReloadTriger]);

    //화면 렌더링 초기 설정 함수
    const [loading, setLoaded] = useState(true);
    const rightFriendPreset = async () => {
        const res1 = await getAxios(getFolloweeListUrl, {}, refreshAccessToken);//내가 팔로우 중인 유저 불러오기
        const tmp1 = [...res1.data.data];
        setFolloweeList(tmp1);

        const res2 = await getAxios(getfollowerListUrl, {}, refreshAccessToken);//나를 팔로우 중인 유저 불러오기
        const tmp2 = [...res2.data.data];
        setFollowerList(tmp2);

        const res3 = await getAxios(getcurrentProfileUrl, {}, refreshAccessToken);//내 정보 불러오기
        setMyProfileName(res3.data.data.nickname);
        setMyProfileImage(res3.data.data.imgUrl);

        setLoaded(false);
    };
    useEffect(() => {rightFriendPreset();}, []);

    useEffect(() => {//유저의 page에서 팔로우 클릭 시 친구 정보를 다시 불러온다.
        if(!userPageAndFriendReloadTriger) return;//false인 경우 실행 X
        rightFriendPreset();
        setUserPageAndFriendReloadTriger(false);
    }, [userPageAndFriendReloadTriger]);

    const friendListSet = () => {
        //follower와 follwee에 동시에 속한 값들은 친구로 저장
        const JSONFollowerList = followerList.map(d => JSON.stringify(d));
        const JSONFolloweeList = followeeList.map(d => JSON.stringify(d));
        const JSONFriendList = JSONFollowerList.filter(x => JSONFolloweeList.includes(x));
        setFriendList(JSONFriendList.map(d => JSON.parse(d)));
    };
    useEffect(friendListSet, [followerList, followeeList]);

    return(
        loading ? null :
        <div className={Style.wholeCover}>
            <div className={Style.Cover}>
                <Profile img={myProfileImage} name={myProfileName} userId={userId} leftBookChangeHandler={leftBookChangeHandler}/>
            </div>
            <RenderRightFriend friendList={friendList} leftBookChangeHandler={leftBookChangeHandler}/>
        </div>
    );
}

export default RightFriend;