import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ReactComponent as Cancel } from "../icons/cancel.svg";
import axios from "axios";

function LayerPopup() {
  const [data, setData] = useState([]);
  // 하루동안 보지 않기 클릭시 24시간후 만료되는 쿠키를 생성하는 함수.
  const fetchPopup = async () => {
    const res = await axios.get(
      "https://spovalley.s3.ap-northeast-2.amazonaws.com/popup.json"
    );
    const result = res.data;
    setData(result);
  };
  useEffect(() => {
    fetchPopup();
  }, []);

  const setCookie = (name, value) => {
    let todayDate = new Date();
    todayDate.setDate(todayDate.getDate() + 1);
    document.cookie =
      name +
      "=" +
      escape(value) +
      "; path=/; expires=" +
      todayDate.toGMTString() +
      ";";
  };
  if (!data.success) return null;
  return (
    <>
      {data?.popup?.map((item) => {
        return <PopupBox item={item} key={item.id} setCookie={setCookie} />;
      })}
    </>
  );
}
export default LayerPopup;

function PopupBox({ setCookie, item }) {
  const {
    id,
    width,
    height,
    top,
    left,
    url,
    position,
    startedAt,
    finishedAt,
  } = item;

  const [start, setStart] = useState(startedAt.split(" "));
  const [finishe, setFinishe] = useState(finishedAt.split(" "));
  const [visible, setVisible] = useState();
  const [time, setTime] = useState();

  // 쿠키값 구하는
  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        const result = c.substring(name.length, c.length);
        if (result === `${cname}popup`) {
          return false;
        }
      }
    }
    return true;
  }

  function getTime(str, fin) {
    const strTime = Date.parse(`${str[0]}T${str[1]}`);
    const finTime = Date.parse(`${fin[0]}T${fin[1]}`);
    const nowDate = new Date();
    const nowTime = Date.parse(`${nowDate}`);
    if (strTime < nowTime && finTime > nowTime) return true;
    return false;
  }

  useEffect(() => {
    // 저장된 쿠키값 비교후 현재 팝업창의 쿠키값이 있으면 false/ 없으면 true
    setVisible(getCookie(id));
    // 시작시간, 끝나는시간, 현재시간 타임스탬프로 변경후 if문을 이용해 true/false값 구해 useState에 넣어준다.
    setTime(getTime(start, finishe));
  }, []);

  const close = () => {
    setVisible(false);
  };

  return (
    <ContentBox
      position={position}
      visible={visible && time}
      top={top}
      left={left}
    >
      <BtnBox>
        <CloseIcon onClick={close} />
      </BtnBox>
      <ImgBox
        width={width > 0 ? width : null}
        height={height > 0 ? height : null}
        src={url}
        alt={`이벤트팝업 ${id}`}
      />
      <Button
        onClick={() => {
          setCookie(`${id}`, `${id}popup`);
          close();
        }}
      >
        하루 동안 보지 않기
      </Button>
    </ContentBox>
  );
}

const ContentBox = styled.div`
  display: flex;
  z-index: 1000;
  flex-direction: column;
  justify-content: space-around;
  ${(props) => {
    if (props.position === "CENTER") {
      return ` 
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `;
    } else if (props.position === "ABSOLUTE") {
      return `
        position: absolute;
        top: ${(props) => props.top}px;
        left: ${(props) => props.left}px;
      `;
    }
  }};
  ${(props) => {
    if (props.visible) {
      return `
        display: block;
      `;
    } else {
      return `
        display: none;
      `;
    }
  }}
`;

const ImgBox = styled.img`
  max-height: 800px;
  max-width: 550px;
`;

const BtnBox = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  justify-content: flex-end;
`;

const CloseIcon = styled(Cancel)`
  width: 26px;
  height: 26px;
  fill: #fff;
  cursor: pointer;
  &:hover {
    fill: #ffe100;
  }
`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-radius: 7px;
  color: #fff;
  cursor: pointer;
  font-size: 20px;
  margin-top: 10px;
  &:hover {
    color: #ffe100;
  }
`;
