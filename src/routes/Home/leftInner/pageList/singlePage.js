import Style from './pageList.module.css';

const SinglePage = ({data, setPageId, lastPageInUserPage}) => {
  const singlePageClickHandler = (event) => {
    event.preventDefault();
    setPageId(event.target.id);
  };

  return(
    <img src={data.imgUrl} className={Style.singlePage} id={data.pageId} onClick={singlePageClickHandler} ref={lastPageInUserPage}/>
  );
};

export default SinglePage;