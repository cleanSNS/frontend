import Style from './passwordSetting.module.css';
import {useState, useEffect} from 'react';
import {
    passwordCheck,
    passwordChangeUrl
} from '../../../../apiUrl';
import { postAxios } from '../../../../apiCall';

const PasswordSetting = ({refreshAccessToken}) => {
    //useState 선언
    const [previousPassword, setPreviousPassword] = useState("");
    const [passwordChange, setPasswordChange] = useState("");
    const [passwordChangeCheck, setPasswordChangeCheck] = useState("");
    const [passwordCondition, setPasswordCondition] = useState(false);//조건 확인

    //비밀번호 변경 함수
    const previousPasswordChangeHandler = (event) => {
        event.preventDefault();
        setPreviousPassword(event.target.value);
    };
    const passwordChangeChangeHandler = (event) => {
        event.preventDefault();
        setPasswordChange(event.target.value);
        setPasswordChangeCheck("");
    };
    const passwordChangeCheckChangeHandler = (event) => {
        event.preventDefault();
        setPasswordChangeCheck(event.target.value);
    };

    //submit handler
    const [passwordSubmitClicked, setPasswordSubmitClicked] = useState(false);

    const submitAbleAgain = () => {
        setPasswordSubmitClicked(false);
        const btn = document.querySelector('#passwordSubmitBtn');
        btn.innerHTML = '수정';
        btn.style.color = 'white';
        btn.style.backgroundColor = '#F4DEDE';
        btn.style.cursor = 'pointer';
        btn.disabled = false;
    };

    const submitHandler = (event) => {
        event.preventDefault();
        if(passwordSubmitClicked) return;//이미 제출중이면 실행X

        if(previousPassword === passwordChange){
            alert("바꾸려는 비밀번호가 동일합니다.");
            return;
        }
        if(!passwordCondition){
            alert("새 비밀번호가 비밀번호 조건에 맞지 않습니다.");
            return;
        }
        if(passwordChange !== passwordChangeCheck){
            alert("새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        setPasswordSubmitClicked(true);
        const btn = document.querySelector('#passwordSubmitBtn');
        btn.innerHTML = "제출중";
        btn.style.color = 'black';
        btn.style.backgroundColor = 'gray';
        btn.style.cursor = 'wait';
        btn.disabled = true;
    };

    const changePassword = async () => {
        const sendBody = {
            password: passwordChange,
        };

        await postAxios(passwordChangeUrl, sendBody, {}, refreshAccessToken);
        alert("비밀번호가 변경되었습니다.");
        submitAbleAgain();//다시 보낼 수 있게 설정
        setPreviousPassword("");
        setPasswordChange("");
        setPasswordChangeCheck("");
    };

    const submitHandlerSecondAct = async () => {
        if(!passwordSubmitClicked) return;//불필요한 호출 차단

        const sendBody = {
            password: previousPassword,
        };
        const res = await postAxios(passwordCheck, sendBody, {}, refreshAccessToken);
        if(res.data){//일치하면
            await changePassword();
        }
        else{
            alert("기존 비밀번호가 일치하지 않습니다.");
            submitAbleAgain();//다시 보낼 수 있게 설정
        }
    };
    useEffect(() => {submitHandlerSecondAct();}, [passwordSubmitClicked])

    //비밀번호 동일한지 확인해서 style바꿔주는 함수
    const passwordCheckSameCheck = () => {
        if(passwordChangeCheck === ""){//비어있으면 빨간 선을 없앤다.
            document.querySelector("#passwordChangeCheck").style.outline = "solid 1px rgb(186, 186, 186)";
            return;
        }
        if(passwordChangeCheck !== passwordChange){
            document.querySelector("#passwordChangeCheck").style.outline = "solid 2px rgb(218, 86, 86)";
        }
        else{
            document.querySelector("#passwordChangeCheck").style.outline = "solid 1px rgb(186, 186, 186)";
        }
    };
    useEffect(passwordCheckSameCheck, [passwordChangeCheck]);


    //비밀번호 조건확인
    function passwordValidCheck(str){
        const PWD_RULE =  /^(?=.*[a-zA-Z])((?=.*\d)(?=.*\W)).{8,16}$/;
        return str.match(PWD_RULE);
    };

    //비밀번호 조건확인하는 함수 함수
    const passwordValid = () => {
        setPasswordCondition(passwordValidCheck(passwordChange));
    };
    useEffect(passwordValid, [passwordChange]);

    return(
        <form className={Style.WholeCover} onSubmit={submitHandler}>
            <div className={Style.Cover}>
                <div className={Style.formArea}>
                    {/* 현재 비밀번호 */}
                    <div className={Style.Cover}>
                        <label
                            htmlFor="prevPW"
                            className={Style.settingLabel}>
                            이전 비밀번호
                        </label>
                    </div>
                    <div className={Style.Cover}>
                        <input 
                            id="prevPW"
                            type="password"
                            value={previousPassword}
                            onChange={previousPasswordChangeHandler}
                            className={Style.settingInput}
                        />
                    </div>
                    {/* 새 비밀번호 */}
                    <div className={Style.Cover}>
                        <label
                            htmlFor='passwordChange'
                            className={Style.settingLabel}>
                            새 비밀번호
                        </label>
                    </div>
                    <div className={Style.Cover}>
                        <input
                            id="passwordChange"
                            type="password"
                            value={passwordChange}
                            onChange={passwordChangeChangeHandler}
                            className={Style.settingInput}
                        />
                    </div>
                    {/* 새 비밀번호 확인 */}
                    <div className={Style.Cover}>
                        <label
                            htmlFor='passwordChangeCheck'
                            className={Style.settingLabel}>
                            새 비밀번호 확인
                        </label>
                    </div>
                    <div className={Style.Cover}>
                        <input
                            id="passwordChangeCheck"
                            type="password"
                            value={passwordChangeCheck}
                            onChange={passwordChangeCheckChangeHandler}
                            className={Style.settingInput}
                        />
                    </div>
                </div>
            </div>
            <div className={Style.Cover}>
                {passwordCondition ? null : <p className={Style.alertWord}>비밀번호는 8~16자리, 소문자, 특수문자를 하나이상 포함.</p>}
            </div>
            <div className={Style.Cover}>
                <button id="passwordSubmitBtn" type="submit" className={Style.submitButton}>수정</button>
            </div>
        </form>
    );
}

export default PasswordSetting;