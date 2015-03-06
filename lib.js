/*
Fkataev @Blackjack
*/

function library(module) {
    $(function() {
        if (module.init) {
            module.init();
        }
    });
    
    return module;
}
 
var blackjack = library(function() {
    return {
        data: {
            //настройки
            card_sample : ".card_sample",
            sample_card_class : "card_sample",
            default_card_class : "card",
            dealer_el : ".dealer",
            player_el : ".player",
            bet_el : ".bet",
            diag_el : ".diag",
            casino_money : ".casino_money",
            your_money : ".your_money",
            width : 112.5,
            height : 157.5,
            actions : {
                double : "#double",
                hit : "#hit",
                stand : "#stand",
                next : "#next"
            },
            //переменные в игре
            stock : false,
            dealer_money : 20000,
            player_money : 5000,
            dealer_cards : [],
            player_cards : [],
            dealer_scores : 0,
            player_scores : 0,
            bet : 1000,
            bank : 0,
            win : ""
        },
        init: function() {
            //загрузим карты
            $.ajax( "cards", {
                async : false,
                dataType : "json",
                complete : function(data, status) {
                    if(status === 'success')
                        blackjack.data.stock = data.responseJSON;
                    else
                        blackjack.stop("Не получается загрузить данные по игральным картам!");
                }
            });
            
            this.data.dealer_money = this.data.dealer_money - this.data.bet;
            this.data.player_money = this.data.player_money - this.data.bet;
            blackjack.action("hit");
            
            //события
            $(this.data.actions.hit).click(function(e){
                blackjack.action("hit");
                e.preventDefault();
            });
            
            $(this.data.actions.stand).click(function(e){
                blackjack.action("stand");
                e.preventDefault();
            });
            
            $(this.data.actions.double).click(function(e){
                blackjack.action("double");
                e.preventDefault();
            });
            
            $(this.data.actions.next).click(function(e){
                blackjack.action("next");
                e.preventDefault();
            });
        },
        reload: function(side) {
            if(side === "dealer") {
                if(this.data.dealer_cards[this.data.dealer_cards.length - 1].t === 1) {
                    if((this.data.dealer_scores + this.data.dealer_cards[this.data.dealer_cards.length - 1].n) > 21) {
                        this.data.dealer_scores += 1;
                    }
                    else {
                        this.data.dealer_scores += this.data.dealer_cards[this.data.dealer_cards.length - 1].n;
                    }
                }
                else {
                    this.data.dealer_scores += this.data.dealer_cards[this.data.dealer_cards.length - 1].n;
                }

                $(this.data.dealer_el).empty();

                for(var i = 0; i < this.data.dealer_cards.length; i++) {
                    var pos_x = this.data.dealer_cards[i].p1 * this.data.width * (-1);
                    var pos_y = this.data.dealer_cards[i].p0 * this.data.height * (-1);
                    $(this.data.card_sample).clone()
                            .css({background:'url("cards.gif") '+pos_x+'px '+pos_y+'px no-repeat'})
                            .removeClass(this.data.sample_card_class)
                            .addClass(this.data.default_card_class)
                            .appendTo(this.data.dealer_el);
                }

                if(this.data.dealer_scores === 21 || this.data.dealer_scores > this.data.player_scores) {
                    //блекджек
                    this.data.win = "dealer";
                }

                if(this.data.dealer_scores > 21) {
                    //проигрыш
                    this.data.win = "player";
                }
            }
            else if(side === "player") {
                if(this.data.player_cards[this.data.player_cards.length - 1].t === 1) {
                    if((this.data.player_scores + this.data.player_cards[this.data.player_cards.length - 1].n) > 21) {
                        this.data.player_scores += 1;
                    }
                    else {
                        this.data.player_scores += this.data.player_cards[this.data.player_cards.length - 1].n;
                    }
                }
                else {
                    this.data.player_scores += this.data.player_cards[this.data.player_cards.length - 1].n;
                }

                $(this.data.player_el).empty();
                $(this.data.dealer_el).empty();

                for(var i = 0; i < this.data.player_cards.length; i++) {
                    var pos_x = this.data.player_cards[i].p1 * this.data.width * (-1);
                    var pos_y = this.data.player_cards[i].p0 * this.data.height * (-1);
                    $(this.data.card_sample).clone()
                            .css({background:'url("cards.gif") '+pos_x+'px '+pos_y+'px no-repeat'})
                            .removeClass(this.data.sample_card_class)
                            .addClass(this.data.default_card_class)
                            .appendTo(this.data.player_el);
                }

                if(this.data.player_scores === 21) {
                    //блекджек
                    this.data.win = "player";
                }

                if(this.data.player_scores > 21) {
                    //проигрыш
                    this.data.win = "dealer";
                }
            }
            
            //проверка победителя
            if(this.data.win === "dealer") {
                this.data.dealer_money += this.data.bank;
                this.data.bank = 0;
                $(this.data.diag_el).css({color:"red"}).text("Побеждает казино.");
                
                if(this.data.player_money === 0)
                    $(this.data.diag_el).css({color:"red"}).text("Прости братух. Но ты проигрался в пух и прах. Иди напейся что ли.");
            }
            else if(this.data.win === "player") {
                this.data.player_money += this.data.bank;
                this.data.bank = 0;
                $(this.data.diag_el).css({color:"green"}).text("Побеждает игрок.");
                
                if(this.data.dealer_money === 0)
                    $(this.data.diag_el).css({color:"green"}).text("Красавчик, обчистил казино.");
            }
            
            $(this.data.bet_el).text("Ставка: " + this.data.bank);
            $(this.data.your_money).text("Ваши деньги: " + this.data.player_money);
            $(this.data.casino_money).text("Деньги казино: " + this.data.dealer_money);
        },
        card: function() {
            //получим из колоды случайную карту
            var num = Math.floor(Math.random() * 52);
            
            return this.data.stock[num];
        },
        stop: function(err) {
            //остановка игры
            console.log(err);
        },
        action: function(mode) {
            if(this.data.win === "" || mode === "next") {
                switch(mode) {
                    case "next" : {
                        if(this.data.win !== "" && this.data.player_money !== 0 && this.data.dealer_money !== 0) {
                            this.data.win = "";
                            this.data.dealer_scores = 0;
                            this.data.player_scores = 0;
                            this.data.player_cards.length = 0;
                            this.data.dealer_cards.length = 0;
                            this.data.dealer_money = this.data.dealer_money - this.data.bet;
                            this.data.player_money = this.data.player_money - this.data.bet;
                            $(this.data.diag_el).empty();
                            this.action("hit");
                        }
                        break;
                    }
                    case "double" : {
                        if(this.data.player_money === 0) {
                            $(this.data.diag_el).css({color:"green"}).text("У тебя не хватает баблишка, чтоб удвоить.");
                        }
                        else if(this.data.dealer_money === 0) {
                            $(this.data.diag_el).css({color:"red"}).text("У казино не хватает баблишка, чтоб удвоить.");
                        }
                        else {
                            this.data.bank += this.data.bet*2;
                            this.data.dealer_money = this.data.dealer_money - this.data.bet;
                            this.data.player_money = this.data.player_money - this.data.bet;
                            this.data.player_cards.push(this.card());
                            this.reload("player");
                            this.action("stand");
                            break;
                        }
                    }
                    case "hit" : {
                        this.data.bank = this.data.bet * 2;
                        this.data.player_cards.push(this.card());
                        this.reload("player");
                        break;
                    }
                    case "stand" : {
                        //играем за диллера
                        while(this.data.win === "") {
                            this.data.dealer_cards.push(this.card());
                            this.reload("dealer");
                        }
                        break;
                    }
                }
            }
        }
    };
}());