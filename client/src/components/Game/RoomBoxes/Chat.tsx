import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import BoxTitle from '../../Util/ContentBox/BoxTitle';
import BoxContent from '../../Util/ContentBox/BoxContent';

import {useWebSocket} from '../../../index';
import {useUser} from '../../../hooks/useUser';

// @ts-ignore
import pingEffect from '../../../assets/audios/effects/ping.mp3';
import {Howl} from "howler";

const ContainerStyle = styled.div`
    color: #111111;
    box-shadow: 0px 2px 1px #DDDDDD;
    background-color: #EEEEEE;
    float: left;
    padding: 5px;
    width: 790px;
    height: 190px;
`;

const MessagesStyle = styled.div`
    height: 120px;
    width: 100%;
    overflow-y: scroll;
`;

const MessagesInputStyle = styled.input`
    float: left;
    margin-top: 5px;
    width: calc(100% - 85px);
    height: 20px;
    
    font-family: inherit;
    padding: 5px;
    border: 1px solid #AAAAAA;
    border-radius: 10px 0px 0px 10px;
    resize: none;
`;

const MessagesSendStyle = styled.button`
    float: left;
    margin-top: 5px;
    width: 60px;
    height: 20px;

    box-sizing: inherit;
    font-family: inherit;
    padding: 5px;
    border: 1px solid #AAAAAA;
    border-left: none;
    border-radius: 0px 10px 10px 0px;
    background-color: #EEEEEE;
    transition: all 200ms ease;
`;

const MessageStyle = styled.div`
    float: left;
    margin: 2px 0px;
    width: 100%;
    overflow: hidden;
`;

const MessageHeaderStyle = styled.div`
    float: left;
    margin-right: 9px;
    width: 100px;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
    
    &:hover {
        background-color: #FFF;
    }
`;

const MessageBodyStyle = styled.div`
    float: left;
    width: calc(100% - 190px);
    min-height: 14px;
`;

const MessageFooterStyle = styled.div`
    float: left;
    padding-top: 2px;
    width: 75px;
    font-size: 11px;
    text-align: right;
    color: #999999;
`;

interface ChatDetail {
    readonly nickname: string;
    readonly text: string;
}

export const Chat: React.FC = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [chatlog, setChatLog] = useState<ChatDetail[]>([]);
    const ref = useRef<HTMLDivElement>(null);
    const ws = useWebSocket();
    const user = useUser();
    const pingSoundEffect = new Howl({
        src: [pingEffect]
    });

    const onInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(evt.target.value);
    };

    const onEnterKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendChat();
        }
    };

    const sendChat = () => {
        if (inputValue !== '') {
            ws.emit('chat', {nickname: user !== undefined ? user.nickname : 'test', text: inputValue});
            setInputValue('');
        }
    };

    const getTime = () => {
        const today = new Date();
        let hours = today.getHours();
        const mins = today.getMinutes();
        let minsWithZero;
        const amOrPM = hours >= 12 ? '오후' : '오전';

        hours = hours % 12;
        hours = hours ? hours : 12;
        minsWithZero = mins < 10 ? '0' + mins : mins;

        return `${amOrPM} ${hours}시 ${minsWithZero}분`;
    };

    const scroll = () => {
        ref.current!!.scrollTop = 99999;
    };

    useEffect(() => {
        scroll();
    });

    useEffect(() => {
        const handler = (data: any) => {
            setChatLog(chatlog => [...chatlog, data]);
            pingSoundEffect.play();
        };

        ws.addListener('chat', handler);

        return () => {
            ws.removeListener('chat', handler);
        };
    }, []);

    return (
        <>
            <ContainerStyle>
                <BoxTitle>채팅</BoxTitle>
                <BoxContent>
                    <MessagesStyle ref={ref}>
                        {
                            chatlog.map((chat, index) => {
                                return (
                                    <MessageStyle key={index}>
                                        <MessageHeaderStyle>{chat.nickname}</MessageHeaderStyle>
                                        <MessageBodyStyle>{chat.text}</MessageBodyStyle>
                                        <MessageFooterStyle>{getTime()}</MessageFooterStyle>
                                    </MessageStyle>
                                );
                            })
                        }
                    </MessagesStyle>
                    <MessagesInputStyle value={inputValue} onChange={onInputChange} onKeyDown={onEnterKeyPress}
                                        placeholder={'전송할 메세지를 입력해주세요.'}/>
                    <MessagesSendStyle onClick={sendChat}>전송</MessagesSendStyle>
                </BoxContent>
            </ContainerStyle>
        </>
    );
};

export default Chat;