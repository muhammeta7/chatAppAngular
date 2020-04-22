import {AfterContentInit, AfterViewInit, Component, OnInit} from '@angular/core';
import {Channel} from "./model/channel";
import {Message} from "../messages/model/message";
import {UserViewModel} from "../sign-up/sign-up.component";
import {ChannelService} from "../shared/channel.service";
import {MessageService} from "../shared/message.service";
import {UserService} from "../shared/user.service";



@Component({
    selector: 'app-channels',
    templateUrl: './channels.component.html',
    styleUrls: ['./channels.component.scss']
})
export class ChannelsComponent implements OnInit, AfterContentInit {
    channels: Channel[] = [];
    channelMessages: Message[] = [];
    channelUsers: any[] = [];
    currentChannelId:number = 0;
    isShow:boolean = false;

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

    dmChannels:Channel[] = [];

    otherUser:UserViewModel = {
        id: null,
        firstName: '',
        lastName: '',
        connected: true,
        userName: '',
        password: '',
        messages: [],
        channels: []
    };

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

    ngAfterContentInit(): void {

    }

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

    public showHiddenElement(){
        this.isShow = !this.isShow;
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
                console.log(res);
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
    }

    createDmChannel(otherUserName:string){
        this.channelService.createDmChannel(this.currentUser.userName, otherUserName, this.dmChannelModel).subscribe(
            res => {
                this.dmChannels.push(res);
            },error => {
                alert("An error has occurred while creating Channel.");
            }
        );
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
        if(confirm("Are you sure you would like to delete this channel")){
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

    getChannelMessages(channel: Channel){
        this.currentChannelId = channel.id;
        this.messageService.getChannelMessages(channel.id).subscribe(
            res => {
                this.channelMessages = res;
            },
            error => {
                alert("Error occurred while retrieving messages");
            }
        );
    }



}
