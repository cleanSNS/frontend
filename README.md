# FrontEnd
# 작업을 진행하며 발생한 문제와 해결방안을 작성했습니다.

1. CSS에 대하여
	: 원래 범위를 지정하고 위치를 잡는데 어려움이 있었다.
	: 계속해서 div로 어떤 요소를 감싸준다고 생각해보니 편해졌다.
	=> 그 요소의 속성을 position : relative;를 해서 하위 요소를 하위요소로 확실히 인지 시킨다.
	=> 그 아래의 요소는 position: absolute;를 한다.
		=> 그 아래 요소는 display: grid를 하든 뭘 하든 상관없다.

2. 페이지 전환에 대하여
	: 원래 route를 통해 진행중이었다
		=> 로그인 하지 않은 상황에서 url을 통해 페이지를 확인하는 것이 가능할 수도 있다.
		=> 그래서 route를 쓰지 않고 useState로 변경했다.
	=> useState로 변경하고나니 문제가 발생했다.
		ex) Login화면에서 로그인메인 - 비밀번호찾기 - 회원가입 이 3가지 페이지의 전환이 원래 잘 이루어졌으나
		     클릭하면 로드후 1초 뒤 다시 원래 로그인 화면으로 돌아가는 문제가 발생
	=> 원인을 생각해 봤다.
		그 결과 그럴수밖에 없음을 인지했다.
		=> useState의 값을 설정된 함수로 변화시키면 화면의 렌더링이 발생한다. 즉, 과정은 이러하다
		=> 여기서 로그인 전과 후를 나누는 변수는 state, login페이지에서 사용할 화면은 content로 조절한다.
		1. state가 로그인 이전인 상태
		2. login페이지가 render된다
		3. 회원가입버튼 클릭
		4. 화면에 render발생
		5. 당연하게도 외부부터 render되는데, 이 때, 내부 요소는 다시 초기상태로 render된다. 즉, 그래서 content가 초기값으로 다시 돌아오게 된다.
	=> 그래서 이를 막기 위해 react-route를 쓰는 것임을 알 수 있었다.
	=> 그럼 아에 다시 원래대로 돌아가면 /를 이용해서 마음대로들어오는 것이 가능하다. 어떻게 해결할 수있을까?
	: 나는 react-route의 기능을 온전히 사용하지 못하고 있었다.
		{!isAuthorized ? <Redirect to="/login" /> : <Redirect to="/" />}처럼 Redirect 태그를 이용했어했다.

3. api이용에 대하여
	: fetch를 이용해서 데이터를 가져오는데, 여러 문제들이 발생했었다.
	=> header에서 내가 받으려는 데이터의 형식이 무엇인지 명시해줄 필요가 있었다.
		=> 이것을 하는 이유는 데이터가 통신되는데 있어서 프로토콜의 규칙을 지켜야하기 때문이다.
		=> 프로토콜을 지키지 않은 패킷은 신뢰가 불가하므로 네트워크상에서 제외되기 때문에 이런 문제들이 발생하는 것으로 보였다.
	=> 이런 세부 설정들이 복잡해서 axios를 일단 이용중이지만. 이에 대해서 공부할 필요가 조금 있을 것 같다.
	: 또한 axios로 구현하다보니 GET메소드에서 body가 없다고 되어있다.
		=> GET메소드는 사실 body를 가질 수 있다. 다만, client의 브라우저가 이를 무시하는 경우가 있을 수 있기 때문에 body를 서버에 넘겨야 하는 경우, post를 이용하는 것이 좋아보인다.

4. 비밀번호 확인을 구현하며..
	: useEffect를 이용해서 작업할 필요가 있었다.
	=> useState로만 작업을 진행했더니 뭔가 한템포씩 늦게 업데이트가 진행되었다.
	이유를 생각해보았다.
		1. onChange를 통해서 value변경
		2. useState의 값이 변경되었으므로 render발생( 스타일 변경 이전이므로 변동 X)
		3. 값을 확인해서 요소에 className을 변경해서 스타일 변경
		=> 여기서 함수가 종료되는데, render가 한번 더 발생해야 3에서 변경된 스타일이 화면에 반영된다.
	=> 즉, 위 이유로 인해서 화면의 변화가 한템포씩 늦게 되는 것이었다.
	=> 이를 막기 위해서 useEffect를 사용해보았다.
		1. onChange를 통해서 value변경
		2. useState의 값이 변경되었으므로 render발생(스타일 변경 이전이므로 변동 X)
		3. useEffect에서 지정한 useState의 값이 변경되었으므로 내부 함수 실행
		4. uesEffect에 의해서 render한번 더 발생
	=> 사실 조금 불필요한 render를 줄일 수 있는 방법도 있을 것 같다.
		1. onChange를 통해서 event.target.value를 먼저 가져온다. => 앞으로 바뀔 값이다.
		2. 그 바뀔 값을 이용해서 비밀번호 확인진행
		3. 2의 결과에 따라 스타일 변경
		4. setAAA를 통해서 useState의 값 변경 => 스타일과 값이 동시에 반영되어 render된다.
		=> 즉, useState를 안써도 된다.

5. 비밀번호 유효성 확인
	: 원래는 jQuery를 이용해서 .test를 하는 경우가 많았다고 한다.
	=> 그런데 이거 하나 하자고 jQuery를 불러오는 것은 너무 불필요했다. 그래서 어떻게 해야할지 고민 끝에 방법을 찾았다.
	: 이를 위해서 Rule에 해당하는 부분을 변수로 만들고, 다음 명령을 실행하면 된다.
		(원하는 문자열).match(지정한 Rule) => rule에 맞으면 true를 맞지 않으면 false를 return한다.
	=> 이를 통해서 jQuery를 이용하지 않고 유효성 확인을 할 수 있었다.

6. input클릭시 입력 내용 클릭하게 만들기
	event.target.select();를 이용했다.

7. 소셜 로그인만들기
	: 여전히 진행중이다.
	1. useEffect로 변수 값을 확인한다.
	2. 해당 변수값은 url을 보다가 code 요소가 생기면
	=> 이것에 관해서는 생각을 더 해보자.

8. 어떤 요소 안에 내가 지정한 컴포넌트를 아래로 쭉 이어지게 만들기
	첫 div안에 overflow: auto;를 넣고 크기를 가로,세로 100%로 지정한다.
	그 안에 이제 내가 만들 특정 요소의 크기를 지정하고, display: block;으로 해준다.
	이후 그 안에는 내가 만들고 싶은 요소를 넣으면 된다.

9. 쿠키 접근
	document.cookie로 접근 가능하다.

10. GET 데이터 보내기
	GET방식은 원칙적으로 body를 가지지 않는다. 대신 url을 바꿔서 보낸다.
	?로 url을 마무리하고 이후에 key=value의 형식을 주고, 여러개인 경우 &로 연결한다.

11. Set-Cookie 문제발생
	로그인 시에 Access Token을 Set-Cookie로 전달하여, 이후에 통신에 자동으로 해당 토큰이 쿠키로 헤더에 들어가 있도록 세팅했다.
	하지만 Response로 받은 패킷의 Set-Cookie에 에러가 발생했다.
	에러의 내용은 Set-Cookie에 samesite속성이 설정되지 않았고 이로 인해 samesite=lax로 설정되었으며,
	이에 따라 쿠키를 설정하지 않는다고 되어있었다.
	그래서 백엔드를 작업하는 친구에게 이를 이야기 해서 samesite=default로 설정했다.
	하지만 최근 보안성 업데이트로 인해서 samesite=default를 설정하려면 Secure설정을 해야한다.
	그리고 Secure설정을 하려면 https프로토콜을 사용해야하는데, 현재 도메인 없이 작업중이어서 https로 설정이 불가했다.
	그래서 이제 도메인을 열어, 백엔드와 동일한 IP를 사용하고 https프로토콜을 사용해서 작업을 진행하려고 한다.

12. 부트스트랩에 대해서
	부트스트랩은 CSS를 잘 다루지 못하거나, 단독으로 프로젝트를 진행하는 경우, 무난하게 만들 수 있게 해주는 외부 라이브러리이다. 다만, 세부적인 설정이 불편하다는 단점이 있다(길이를 25%단위로만 설정가능한 것이라든지 여러 제약이 많았다.) 그래서 초기 단계에서 부트스트랩에 의존하여 로그인 페이지를 작성하였으나, 너무 많은 불편함이 느껴져서 결국 CSS를 만들었다.

13. CSS에 대해서
	- 중복 문제
		현재 CSS는 JS단위로 매우 나뉘어서 만들어져있다. 다만 이렇게 만들었더니 반복적으로 짜여져있는 CSS가 매우 많았다. 그래서 개발의 속도가 매우 더디다는 단점이 존재한다.
		그래서 이후에는 중복으로 매우 자주 사용되는 CSS(Cover같이 position: relative;만 있는 틀 클래스, 버튼 클래스 등)를 미리 선언하고 거기서 꺼내서 사용하는 방법을 이용하는 것이 개발 시간을 훨씬 줄일 수 있을 것으로 생각했다.
	- 색상의 다양화 문제
		색상을 지정할 때, 보통 rgb(XX,XX,XX)로 지정하는데, 이 색이 너무 무분별하게 사용된 경향이 있다. 디자인 하기 전에 명확하게 지정하고 스타일을 지정해야 문제가 없을 것으로 생각된다. 그래서 이후에 주로 사용되는 색상을 써놓고, 사용하는 습관을 들일 필요가 있다고 생각했다.

14. AWS
	상황 : AWS로 작업하던 내용을 옮겼다.
	문제 : 기존에 잘 작동하던 api들이 먹통이 되었다.
	해결 방안 : Access-Control-Allow-Origin이 기존에 localhost로 되어있었기 때문에 발생한 문제로 생각된다.

15. SOP(same origin policy)
	=> 같은 도메인에서 온 리소스만 받도록 제한하는 것이고, 이로써 보안성을 확보한다.
	=> 이를 위해서 존재하는 것이 CORS정책이다.

16. npm start 종료
	npm start를 실행하고 putty를 끈 이후, 나중에 다시 Putty로 들어가서 80번 포트로 실행되고있는 내용을 종료하기 위해서는 다음과 같은 과정을 거친다.
	1. lsof -i : 80 => 이후에 실행되고있는 프로세스의 PID를 찾는다.
	2. kill -9 PID번호 => 이러면 꺼진다.
	3. 이제 다시 npm start로 다시 켤 수 있다.

17. https
	http로 하기 위해서는 AWS기기에서 80번 포트를 열고 sudo su를 한 뒤(1024번 이하 포트는 관리자 권한이 필요하다.)npm start를 80번 포트로 켜면 문제없이 켜진다.
	https가 문제다. https로 켜기 위해서 일단 포트번호는 443번으로 해야한다. 그래서 위 작업을 진행했으나 사이트가 켜지지 않았다.
	- 해결법
		1. 일단 HTTPS=true를 해줘야한다. 즉, npm start전에 HTTPS=true npm start로 실행한다.(package.json 수정하면 될거같긴 하다.)
		2. 1번만 실행하면 브라우저에서 위험을 감지한다. 이걸 해결하기 위해서 인증서를 발급해야한다. - AWS의 인증서 시스템을 이용했다.
			1. AWS의 Certificate Manager에서 DNS를 이용해서 인증서를 발급받는다.
			2. 인증서가 정상적으로 발급되면 Route 53에 해당 인증서의 CNAME을 입력한다(자동으로 해준다)
			3. EC2에서 로드밸런서를 적용해야한다.
			4. 로드 밸런서를 생성하면 문제 없이 사용 가능하지만, AWS 로드밸런서는 비용이 많이 발생하므로 다른 시스템을 이용하자는 결론을 내렸다.
		3. SSL For Free 사이트를 이용했다.
			1. 사이트에서 입력된 대로 진행하면(DNS로 인증했다.) 인증서를 발급해준다.
			2. 받은 인증서를 AWS기기로 옮긴다.
				scp -i [pem파일경로] [업로드할 파일 이름] [ec2-user계정명]@[ec2 instance의 public DNS]:~/[경로]
				=> 이 명령어를 통해 진행했다.
			3. 이후 확인을 위해 HTTPS=true SSL_CRT_FILE=(인증서명).crt SSL_KEY_FILE=(키명).key npm start 명령으로 실행. 정상적으로 https가 적용되었다.
			4. 이제 package.json파일을 수정한다.
				=> 일단은 npm start로 테스트중이므로 해당 부분을 아래와 같이 변경했다.
				export PORT=443 && HTTPS=true SSL_CRT_FILE=(인증서명).crt SSL_KEY_FILE=(키명).key react-scripts start
			5. 또한 github에 인증서와 키가 올라가는 것을 막기 위해 보낸 파일들은 frontend의 상위 폴더에 위치시켰다.
				=> 결론은 명령어가 다음과 같다.
				"export PORT=443 && HTTPS=true SSL_CRT_FILE=../certificate.crt SSL_KEY_FILE=../private.key react-scripts start",

18. 누를 수 있는 요소의 경우
	=> button태그에 스타일을 지정하면 그 이후에 마우스를 가져다 대도 마우스가 변하지 않는다.
	=> cursor : pointer;를 통해서 해당 기능을 더할 수 있다.

19. 소셜 버튼이 잘 안눌리는 현상
	=> z-index를 설정해야한다.
	=> 0이 가장 위 Layer고, 그 이후로는 아래로 내려간다.

20. useState와 JS의 얕은 복사
	: 기본적으로 JS는 배열이나 객체의 경우 대입방식으로 변수를 선언하면( tmp = useSome 처럼 ) 얕은 복사가 된다.
		즉, 사실상 같은 변수를 참조하게 된다. 이 경우 useState의 함수를 통해 값을 tmp로 변경해도 render가 발생하지 않는다.
		=> 내부 값이 달라진 것이지 그 배열이나 객체는 그대로이기 때문.
		그래서 배열의 값의 변화에 따라 render를 발생시키고 싶으면 깊은 복사를 해줘야한다. (tmp = [...useSome]처럼)
		이렇게 하면 set(tmp)에 따라 re-render가 발생하게 된다.

21. position을 이용하면 영역이 사라지는 현상
	: position기능을 이용하면 해당 요소의 기능이 사라지는 현상이 생긴다.
	=> 그래서 영역을 그대로 유지하고싶다면 display: flex로 영역을 잡은 뒤 그 안에 요소를 넣으면 그 안에서 position사용이 용이해진다.

22. 이미지 미리보기 기능
	: 이미지 미리보기뿐 아니라, file형태로 참조되어있는 데이터를 문자열의 형태로 전환하여 DB에 저장할 수 있도록 하기 위해서 아래 과정이 필요하다.
	const reader = new FileReader() => 불러오기
	reader.readAsDataURL(File); => 주어진 파일을 URL로 만든다
    reader.onload = (Data) => {
		=> Data가 주어진 파일을 base64로 인코딩하고 확장자나 파일의 형식을 명시한다.
    }
	
23. component is changing an uncontrolled input to be controlled. 에러
	: 해당 에러는 useState변수를 input영역에 value로 넣어줬을 때 발생했다.
	=> 이 에러는 value로 undefined가 들어갔을때의 대책이 없어서 발생하는 것이다. 즉, 그런 경우를 방지해주면 된다.
	: 이 경우 useState를 ""로 초기화해주면서 해결했다

24. useState의 set함수
	: 일반적으로 특정 함수를 실행하고 그 안에서 useState의 set함수를 실행한 경우, 그 함수 내에서는 set함수 실행 이전의 값으로 실행되고, 실행한 함수가 종료된 뒤에 set함수가 실행된다. 즉, set함수는 특정 함수 안에 있으면 set함수를 언제 실행하든 마지막에 실행된다고 생각해야한다.
	=> 그래서 그 값을 통해서 뭘 해야하는 경우, useEffect를 이용하는것이 즉각적으로 반응할 수 있어서 좋다.

25. useInView
	const [ref, inView] = useInView();의 형태로 선언하며, ref를 특정 요소의 ref로 넣어주면 그 요소가 브라우저상에 드러났을 때, inView값이 true로 변한다. 이 점을 이용해서 무한 로딩을 간단하게 구현할 수 있다.

26. 한번의 preset에서 여러번의 axios호출을 하는 경우
	: 그냥 하나씩 둬도 문제는 없으나, then안에 여러번 감싸는 것이 좋은 것으로 생각된다.
		=> 네트워크상에 오류가 있을 때, 해당 문제가 여러번 발생하기 때문이다.
	: 다만 상황에 따라 다를 수 있으므로 판단하에 진행해야한다.

27. refresh토큰으로 access token 재발급
	: access token의 만료는 임의의 api를 호출하면서 인지하게 된다. 에러코드 401이 발생하는 것으로 알 수 있다.
	: 이 경우, access token을 재발급해주는 함수를 호출하여 토큰을 재발급할 수 있게 되는데, 단순하게 catch영역에서 해당 api를 호출하면 access token이 재발급만 되고, 결국 유저가 원래 하려고 했던 일은 발생하지 않게 된다. 그러므로, 토큰 재발급 후, then영역에서 원래의 함수를 다시 호출 하는 형태로 만들어 줘야 (첫 호출 : accesstoken만료 문제) -> (재발급 api 호출 : accesstoken 재발급) -> (첫 호출을 정상 상태로 다시) 가 가능하다. 또한 재발급 api호출시 문제가 생기는 경우는 refresh토큰도 만료된 경우이므로, 이 경우는 다시 로그인을 진행해야한다. 그래서 그 경우 logout함수를 실행하면 된다.

# To Do List
- (오늘중으로) 로그인 시 성별, 나이 공개여부 동의 했는데 막상 설정에 가보면 동의가 안되어있음 - 버그 프론트 쪽 문제인지 확인하고 문제 없으면, 말해주기
- (오늘중으로) refresh토큰 재발급받는 조건 받아서 catch처리 - 토큰 발급 후 다시 submit안눌러도 되게 작동하게 하기
		이거 일단 프로필 세팅에 작업해놨는데 정상작동 확인 되면 아에 refreshAccessToken함수를 잘 변형하기
- (오늘중으로) userID보내면 이미지랑 닉네임 받아오는 api만들어주면 연결하기
- (오늘중으로)api받아서 notice 완성하기
- 채팅 left
- 채팅 right
- 글 피드 left(page)
- 글 피드 눌렀을 때 띄워지는 것
- 해당 유저의 페이지 left(pageList)
- 검색창 기능 확실하게 합의해서 진행하기