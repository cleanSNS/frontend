import Style from './newPost.module.css';
import { useEffect, useState } from 'react';
import addImage from '../../root/tagImages/add.png';
import { ImageValid } from '../../../../ImageValidCheck';

const LeftNewPost = ({renderedNewPostImages, setRenderedNewPostImages, newPostImages, setNewPostImages, newPostHashtag, setNewPostHashtag, newPostContent, setNewPostContent, uploadNewPostHandler }) => {
    const [hashtag, setHashtag] = useState("");//임시로 입력되는 값 변경하는 State.

    //처음 로드되면 이미지 파일, 해시태그, 글을 초기화 하는 함수
    useEffect(() => {
        setRenderedNewPostImages([]);
        setNewPostImages([]);
        setNewPostHashtag([]);
        setNewPostContent("");
    }, []);

    //글 내용 변경 함수
    const contentHandler = (event) => {
        event.preventDefault();
        setNewPostContent(event.target.value);
    }

    //이미지를 랜더링 해서 집어넣는다.
    const renderImageFiles = (inputFile) => {
        const renderTmp = [...renderedNewPostImages];//지금까지 미리보기로 되어있는 이미지들의 배열
        inputFile.forEach((data) => {
            const reader = new FileReader();
            reader.readAsDataURL(data);
            reader.onload = (imageData) => {
                renderTmp.push(imageData.target.result);
                setRenderedNewPostImages(renderTmp);
            }
        });
    };

    //지금 들어온 파일을 파일 그대로 보낼 state에 넣기
    const loadImageFiles = (inputFile) => {
        const tmp = [...newPostImages];
        const next = tmp.concat(inputFile);
        setNewPostImages(next);
    };

    //이미지 영역에 파일을 드랍한 경우 - ondrop
    const imageDropHandler = (event) => {
        event.preventDefault();

        //들어온 파일을 인식하여 inputFile에 집어넣는다.
        let inputFile = []
        if(event.type === 'change'){//input에 넣은 경우
            inputFile = [...event.target.files];
        }
        else{//드래그 드랍한 경우
            inputFile = [...event.dataTransfer.files];
        }
        if(!ImageValid(inputFile, newPostImages)) return;//입력된 파일이 유효하지 않은 경우 실행X

        renderImageFiles(inputFile);//이미지 렌더링 처리
        loadImageFiles(inputFile);//api에 보낼 수 있도록 파일 자체의 세팅

        //CSS는 반드시 실행된다.
        const imageUploadArea = document.querySelector("#imageUploadArea");
        document.querySelector("#imageUploadImage").style.opacity="1";
        imageUploadArea.style.backgroundColor="white";
        imageUploadArea.style.border="5px dashed rgb(190, 190, 190)";
    };

    //이미지 영역 위에 파일을 올려놓은 경우 - ondragover(이게 있어야 ondrop이 활성화 된다.)
    const imageDragOverHandler = (event) => {
        event.preventDefault();
    };

    //파일을 이미지 영역 위로 최초 진입한 경우 - ondragenter
    const imageDragEnterHandler = (event) => {
        event.preventDefault();
        const imageUploadArea = document.querySelector("#imageUploadArea");
        document.querySelector("#imageUploadImage").style.opacity="0.5";
        document.querySelector("#imageUploadMent").style.visibility="hidden";
        imageUploadArea.style.backgroundColor="rgb(236, 236, 236)";
        imageUploadArea.style.border="5px dashed rgb(150, 150, 150)";
    };

    //파일을 이미지 영역 위에서 벗어나게 한 경우 - ondragleave
    const imageDragLeaveHandler = (event) => {
        event.preventDefault();
        const imageUploadArea = document.querySelector("#imageUploadArea");
        document.querySelector("#imageUploadImage").style.opacity="1";
        document.querySelector("#imageUploadMent").style.visibility="visible";
        imageUploadArea.style.backgroundColor="white";
        imageUploadArea.style.border="5px dashed rgb(190, 190, 190)";
    };

    //hashtag영역 바꿔주는 함수
    const hashtagHandler = (event) => {
        event.preventDefault();
        const value = event.target.value;
        if(value === " "){
            alert("1글자 이상의 키워드를 입력해 주세요");
            return;
        }
        if(value[value.length - 1] === " "){// 이 경우 
            const tmp = newPostHashtag;
            const input = value.slice(0,-1);
            if(!newPostHashtag.includes(input)){
                tmp.push(input);
                setNewPostHashtag(tmp);
                setHashtag("");
            }
            setHashtag("");
        }
        else{
            setHashtag(value);
        }
    }

    //hashtag 지우는 함수
    const deleteTag = (event) => {
        event.preventDefault();
        const tmp = [...newPostHashtag];
        tmp.splice(Number(event.target.value), 1);
        setNewPostHashtag(tmp);
    };

    //이미지 지우는 함수
    const deleteImage = (event) => {
        event.preventDefault();
        const tmp = [...renderedNewPostImages];
        tmp.splice(Number(event.target.id), 1);
        setRenderedNewPostImages(tmp);

        const tmp2 = [...newPostImages];
        tmp2.splice(Number(event.target.id), 1);
        setNewPostImages(tmp2);
    };

    return(
        <form className={Style.WholeCover} onSubmit={uploadNewPostHandler}>
            {/* 드래그 앤 드롭 영역 */}
            <div className={Style.pictureArea}>
                <div className={Style.picture} id="imageUploadArea" onDrop={imageDropHandler} onDragOver={imageDragOverHandler} onDragEnter={imageDragEnterHandler} onDragLeave={imageDragLeaveHandler}>
                    <input type="file" multiple id="userImageInput" accept="image/*" style={{display:"none"}} onChange={imageDropHandler}/>
                    <label htmlFor="userImageInput"><img src={addImage} className={Style.pictureinnerimage} id="imageUploadImage"/></label>
                    <p className={Style.pictureinnerword} id="imageUploadMent">업로드할 이미지를 여기로 옮겨주세요.</p>
                </div>
            </div>
            {/* 올린 이미지 미리 보기 영역 */}
            <div className={Style.ListArea} style={{overflow: "auto"}}>
                <div style={{width: `${renderedNewPostImages.length * 200}px`, height: "100%"}}>
                    {
                        renderedNewPostImages.map((data, index) =>(
                            <img className={Style.singlepicture} src={data} key={index} id={index} onClick={deleteImage} />
                        ))
                    }
                </div>
            </div>
            {/* hashtag label 영역 */}
            <p className={Style.hashtag}>키워드 (띄어쓰기로 분리해주세요)</p>
            {/* hashtag input 영역 */}
            <input 
                type="text"
                value={hashtag}
                onChange={hashtagHandler}
                className={Style.hashtagInput}
            />
            {/* hashtag list 영역 */}
            <div className={Style.ListArea} style={{overflow: "auto"}}>
                <div style={{width: "100%", height: "100px"}}>
                    {
                        newPostHashtag.map((data, index) =>(
                            <button className={Style.singleHashTag} onClick={deleteTag} key={index} value={index}>#{data}</button>
                        ))
                    }
                </div>
            </div>
            {/* word label 영역 */}
            <p className={Style.word}>글을 입력해 주세요</p>
            {/* word input 영역 */}
            <textarea 
                type="text" 
                vaslue={newPostContent}
                onChange={contentHandler}
                maxLength={200}
                className={Style.wordInput} />
            {/* 글 제출 영역 */}
            <div className={Style.area}>
                <button id="newPageSubmitBtn" type="submit" className={Style.submitButton}>Submit</button>
            </div>
        </form>
    );
};

export default LeftNewPost;