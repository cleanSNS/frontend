import Style from './pageList.module.css';

const UserListArea = ({data, leftBookChangeHandler}) => {
  const userClickHander = (event) => {
      event.preventDefault();
      leftBookChangeHandler("pList/" + event.target.id.split('_')[1]);
  };

  return(
    <div className={Style.userArea} key={index} onClick={userClickHander} id={`pageListUserId_${data.userId}`}>
        <img src={data.imgUrl} className={Style.userImg} id={`pageListUserId_${data.userId}`}/>
        <p className={Style.userNickname} id={`pageListUserId_${data.userId}`}>{data.nickname}</p>
    </div>
  );
};

export default UserListArea;