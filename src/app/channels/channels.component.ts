import {AfterContentInit, AfterViewInit, Component, OnInit} from '@angular/core';
import {Channel} from "./model/channel";
import {Message} from "../messages/model/message";
import {UserViewModel} from "../sign-up/sign-up.component";
import {ChannelService} from "../shared/channel.service";
import {MessageService} from "../shared/message.service";
import {UserService} from "../shared/user.service";
import {interval} from "rxjs";



@Component({
    selector: 'app-channels',
    templateUrl: './channels.component.html',
    styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent implements OnInit{
    channels: Channel[] = [];
    channelMessages: Message[] = null;
    channelUsers: any[] = [];
    currentChannelId:number = 0;

    publicChannels:Channel[] = [];

    currentUser:UserViewModel = {
        id: null,
        firstName: '',
        lastName: '',
        connected: true,
        userName: '',
        password: '',
        messages: [],
        channels: []
    };

    channelModel:Channel = {
        id: null,
        channelName:'',
        isPrivate: true,
        isDm:false,
        messages:[],
        users: []
    };

    messageModel: Message = {
        id: null,
        content: '',
        timestamp: null,
        sender: null,
        channel: null
    };

    newMessage:Message = null;

    currentMessage:Message;

    dmChannels:Channel[] = [];

    validEdit = false;

    dmChannelModel:Channel = {
        id: null,
        channelName:'',
        isPrivate: true,
        isDm:true,
        messages:[],
        users: []
    };

    constructor(private channelService: ChannelService,
                private messageService: MessageService,
                private userService: UserService
    ) { }

    ngOnInit() {
        this.getChannelsByUser(sessionStorage.getItem("username"));
        this.userService.getUserByUserName(sessionStorage.getItem('username')).subscribe(
            data => {
                this.currentUser = data;
                data.connected = true;
                this.getDmChannels();
            });
        this.getAllUsers();
        this.getAllPublicChannels();
    }

    selectCurrent(message: Message){
        this.currentMessage = message;
    }

    public getAllUsers(): UserViewModel[]{
        this.userService.getAllUsers().subscribe(
            res => {
                this.channelUsers = res;
            }, error => {
                alert("Error");
            }
        );
        return this.channelUsers;
    }

    public getAllPublicChannels(){
        this.channelService.getAllPublicChannels().subscribe(
            res => {
                this.publicChannels = res;
            },
            error => {
                alert("An error has occurred.");
            }
        );
    }

    public getChannelsByUser(username: string){
        this.userService.getAllChannelsByUser(username).subscribe(
            res => {
                this.channels = res;
            }, error =>{
                alert("An error has occurred.");
            }
        );
    }


    public getDmChannels(){
        this.userService.getAllDmChannels(this.currentUser.userName).subscribe(
            res => {
                this.dmChannels = res;
            },error => {
                alert("An error has occurred.");
            }
        );
    }

    sendMessage(messageModel: Message) {
        this.messageService.createMessage(this.currentChannelId,this.currentUser.id, messageModel).subscribe(
            res => {
                this.newMessage = res;
                this.channelMessages.push(this.newMessage);
            },error => {
                alert("Error while sending message.");
            }
        );
    }

    createChannel() {
        this.channelService.createChannel(this.currentUser.id,this.channelModel).subscribe(
            res => {
                this.channels.push(res);
            },error => {
                alert("An error has occurred while creating Channel.");
            }
        );
        this.channelModel.channelName = '';
    }

    createDmChannel(otherUserName:string){
        this.channelService.createDmChannel(this.currentUser.userName, otherUserName, this.dmChannelModel).subscribe(
            res => {
                this.dmChannels.push(res);
            },error => {
                alert("An error has occurred while creating Channel.");
            }
        );
        this.dmChannelModel.channelName = '';
    }

    updateChannel(updatedChannel: Channel) {
        this.channelService.createChannel(this.currentUser.id,updatedChannel).subscribe(
            res => {

            },error => {
                alert("An error has occurred while updating Channel")
            }
        );
    }

    updateChannelPrivacy(updatedChannel: Channel){
        if(!updatedChannel.isPrivate){
            this.publicChannels = this.publicChannels.filter(obj => obj.id !== updatedChannel.id);
        } else {
            this.publicChannels.push(updatedChannel);
        }
        updatedChannel.isPrivate = !updatedChannel.isPrivate;
        this.channelService.updatePrivacy(updatedChannel).subscribe(
            res => {

            },error => {
                alert("error");
            }
        );
    }

    deleteChannel(channel: Channel) {
        if(confirm("Are you sure you would like to delete this channel?")){
            this.channelService.deleteChannel(channel.id).subscribe(
                res => {
                    let index = this.channels.indexOf(channel);
                    this.channels.splice(index, 1);
                }, error => {
                    alert("Could not delete channel");
                }
            );
        }
    }


    addMessage = true;
    getChannelMessages(channel: Channel){
        this.currentChannelId = channel.id;
        // setInterval( () => {
        this.messageService.getChannelMessages(channel.id)
        .subscribe(
            res => {
                console.log(this.channelMessages);
                this.channelMessages = res;
                // if(this.channelMessages === null){
                //     this.channelMessages = res;
                //     this.addMessage = false;
                // } else if(this.channelMessages[this.channelMessages.length-1].id != res[res.length-1].id && this.addMessage){
                //     this.channelMessages.push(res[res.length-1]);
                //     this.addMessage = false;
                // }
            },
            error => {
                alert("Error occurred while retrieving messages");

            }
            )
    // }, 1000);
    }

    // refreshChannelMessage(id: number){
    //     const allChannels =
    //         this.publicChannels;
    //     allChannels.push(...this.dmChannels);
    //     allChannels.push(...this.channels);
    //     const channel = allChannels.find(value =>
    //         value.id === id
    //     );
    //     // @ts-ignore
    //     setTimeout(this.getChannelMessages(channel), 1000);
    // }

    updateMessage(){
        this.messageService.updateMessage(this.currentMessage.id, this.currentMessage.content).subscribe(
            res => {
                this.channelMessages.find(value =>
                    value.id === this.currentMessage.id).content = res.content;
                console.log(res);
            }, error => {
                alert("Error while trying to update message.")
            }
        );
    }

    deleteMessage(message:Message){
        if(confirm("Are you sure you would like to delete this message?")){
            this.messageService.deleteMessage(message.id).subscribe(
                res => {
                    let index = this.channelMessages.indexOf(message);
                    this.channelMessages.splice(index,1);
                }, error => {
                    alert("Error while deleting message.");
                }
            );
        }
    }

    checkSender(id: number, id2: number) {
        if (id === id2){
            this.validEdit = true;
        }
    }
}
