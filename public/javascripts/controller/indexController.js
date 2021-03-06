app.controller('indexController', ['$scope', 'indexFactory', 'configFactory', ($scope, indexFactory, configFactory) => {
    /*  
    burada mantık sistemi scope üzerinden yakalamaak
    $scope.messages =[{
        text: 'selam',
    },
    {
        text: 'merhaba'
    }];*/
    $scope.messages = [ ];
    $scope.players ={ };
    
    $scope.init=()=>{
        const username = prompt('Please enter username');
        if (username)
        initSocket(username);
        else
        return false;
        
    };
    function scrollTop() {
    setTimeout(() => {
        //mesaj sonrası scrool aşağı indirme
            const element = document.getElementById('chat-area');
            element.scrollTop=element.scrollHeight; 
        });
    };

    function showBubble(id, message) {
        $('#'+ id).find('.message').show().html(message);
        setTimeout(() => {
            $('#'+ id).find('.message').hide();
        }, 2000);
    }
    
    async function initSocket(username){
        const connectionOptions ={
            reconnectionAttempts: 3,
            reconnectionDelay: 600
        };
        var configAPI = await configFactory.getConfig();
        var url = configAPI.data.socketUrl;
        indexFactory.connectSocket(url, connectionOptions)
        
        .then((socket) =>{
            socket.emit('newUser', {username})
            socket.on('initPlayers', (players) => {
                $scope.players = players;
                $scope.$apply();
            })
            socket.on('newUser', (data) => {
                const messageData = {
                    type:{
                        code: 0, //server or user message
                        message:1
                    }, //giriş info veriyor diğerlerine
                    username: data.username
                };
                
                
                $scope.messages.push(messageData);
                $scope.players[data.id] = data;
                scrollTop();
                $scope.$apply();
            })
            socket.on('disUser', (data) => {
                const messageData = {
                    type:{
                        code: 0, //server or user message
                        message:0 // login or disconnect message
                    }, //giriş info veriyor diğerlerine
                    username: data.username
                };
                
                $scope.messages.push(messageData);
                delete $scope.players[data.id];
                scrollTop();
                $scope.$apply();
            });
            
            socket.on('animate', data => { 
                $('#' + data.socketId).animate({'left':data.x, 'top': data.y}, () =>{
                    animate = false
                });
            });
            let animate = false;
            $scope.onClickPlayer = ($event) => {
                
                if(!animate){
                    let x = $event.offsetX;
                    let y = $event.offsetY;
                    socket.emit('animate', {x, y});
                    animate = true;
                    $('#' + socket.id).animate({'left':x, 'top': y}, () =>{
                        animate = false
                    })        
                }
                
                
            };

            $scope.newMessage = () => {
                let message = $scope.message;
                
                const messageData = {
                    type:{
                        code: 1, //server or user message
                        
                    }, //giriş info veriyor diğerlerine
                    username: username,
                    text: message
                };
            
            $scope.messages.push(messageData);
            $scope.message = ''
            
            socket.emit('newMessage', messageData);
            showBubble(socket.id, message);
            scrollTop();

            }
            socket.on('newMessage', message => {
                $scope.messages.push(message);
                $scope.$apply();
                showBubble(message.socketId, message.text);
                scrollTop();
            })
         
        }).catch((err) => {
            console.log(err);
        });
        
    };
    
}]);    