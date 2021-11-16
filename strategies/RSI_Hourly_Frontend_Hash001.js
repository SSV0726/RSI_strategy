// RSI_Hourly_Frontend_Hash001 Strategy 
// ATM Straddle at  9:21 with 25% 

const logger    = require("pino")();
const utils     = require("../utils");

//---------------------INPUT-------------------------//

const lotSize               = 25;
const tradeSquareOffHour    = 15;
const tradeSquareOffMinute  = 10;
const SL_percentage         = 25;

//---------------------------------------------------//

RSI_Hourly_Frontend_Hash001();

// Stop Execution if Conditions not met before specifc Time 
setInterval( ()=>{
    let dt = new Date();
    if( dt.getHours() >= tradeSquareOffHour && dt.getMinutes() >= (tradeSquareOffMinute+3) ){
        console.log(" Stoping Strategy !! ")
        process.exit(0);
    }
}, 60*1000);

async function RSI_Hourly_Frontend_Hash001(){

    try{
        // Get Current Expiry Details to make CE and PE strikes  
        let expDetails = await utils.getCurrentExpiryDetails();
        utils.print("==============_Expiry_Details_===============\n",expDetails);

        // Get Prev day data for BNF-FUT for calculations in RSI_Hourly_Frontend_Hash001 
        let currFUT = "NFO:BANKNIFTY" + expDetails.year + expDetails.futExpiryMonth + "FUT";
        let futLTP  = await utils.getLTP(currFUT);
        utils.print( currFUT , " = " , futLTP );

        let atmStrike = parseInt( Math.round(futLTP / 100) )*100;
        utils.print(" ATM strike = " , atmStrike);
  
        let ceInstrument = "NFO:BANKNIFTY" + expDetails.year + expDetails.month + expDetails.day + JSON.stringify(atmStrike)  + "CE";
        let peInstrument = "NFO:BANKNIFTY" + expDetails.year + expDetails.month + expDetails.day + JSON.stringify(atmStrike)  + "PE";       
        utils.print({ "ceInstrument" : ceInstrument });
        utils.print({ "peInstrument" : peInstrument });

        let trade1 = {
            "t_type"        : "SELL" ,
            "instrument"    : ceInstrument,
            "product"       : "MIS" ,
            "order_type"    : "MARKET" ,
            "price"         : 0 ,
            "trigger_price" : 0 ,
            "lotSize"       : lotSize ,
            "__side"          : "entry"
        }

        let trade2 = {
            "t_type"        : "SELL" ,
            "instrument"    : peInstrument,
            "product"       : "MIS" ,
            "order_type"    : "MARKET" ,
            "price"         : 0 ,
            "trigger_price" : 0 ,
            "lotSize"       : lotSize ,
            "__side"        : "entry"
        }

        utils.placeTradeOnAllClients( "RSI_Hourly_Frontend_Hash001" , [ trade1 , trade2 ]);         
        

        // Check for SL 
        let ce_ltp = await utils.getLTP(ceInstrument);
        let pe_ltp = await utils.getLTP(peInstrument);
        let ceSL = ce_ltp * ( 100 + SL_percentage )/100 ;
        let peSL = pe_ltp * ( 100 + SL_percentage )/100 ;
        check_SL("RSI_Hourly_Frontend_Hash001" , ceInstrument , ">" , ceSL );
        check_SL("RSI_Hourly_Frontend_Hash001" , peInstrument , ">" , peSL );

        // ALERT
        utils.print(" ce_ltp = " , ce_ltp , " ceSL = ", ceSL );
        utils.print(" pe_ltp = " , pe_ltp , " peSL = ", peSL );
        let alertMessage =  "\n RSI_Hourly_Frontend_Hash001 Executed at " + (new Date()).toLocaleTimeString() + 
                            "\n Sold CE  = " + ceInstrument + " with a SL of " + ceSL +                             
                            "\n Sold PE  = " + peInstrument + " with a SL of " + peSL;
        utils.alertAdmins("RSI_Hourly_Frontend_Hash001",alertMessage);

    }catch(err){
       logger.error(err);
    }

}

async function check_SL(strategy , checkInstrument, condition, SLprice, tradeInstrument){
    utils.print("Inside check_SL() for " , strategy );

    if(tradeInstrument == undefined){
        tradeInstrument = checkInstrument;
    }

    while(1){
        try{
            let dt = new Date();
            let currPrice = await utils.getLTP(checkInstrument);          
            
            if(condition == '<'){
                if(currPrice <= SLprice || (dt.getHours()>= tradeSquareOffHour && dt.getMinutes()>= tradeSquareOffMinute) ){
                    let SQFtrade = {
                        "t_type"        : "BUY" ,
                        "instrument"    : tradeInstrument,
                        "product"       : "MIS" ,
                        "order_type"    : "MARKET" ,
                        "price"         : 0 ,
                        "trigger_price" : 0 ,
                        "lotSize"       : lotSize
                    }
            
                    utils.placeTradeOnAllClients( strategy , [ SQFtrade ]);
                    break;

                }else{
                    utils.print({   type : "CE SL " + checkInstrument,
                                 SLprice : SLprice,
                               currPrice : currPrice ,
                                  safety :  parseFloat( ( currPrice - SLprice ).toFixed(2)) });
                }
            }

            if(condition == '>'){
                if(currPrice >= SLprice || (dt.getHours()>= tradeSquareOffHour && dt.getMinutes()>= tradeSquareOffMinute) ){
                    let SQFtrade = {
                        "t_type"        : "BUY" ,
                        "instrument"    : tradeInstrument,
                        "product"       : "MIS" ,
                        "order_type"    : "MARKET" ,
                        "price"         : 0 ,
                        "trigger_price" : 0 ,
                        "lotSize"       : lotSize
                    }
            
                    utils.placeTradeOnAllClients( strategy , [ SQFtrade ]);                   
                    break;

                }else{
                    utils.print({   type : "PE SL " + checkInstrument,
                                 SLprice : SLprice,
                               currPrice : currPrice,
                                  safety : parseFloat( (SLprice - currPrice).toFixed(2)) });
                }
            } 
        }catch(err){
            logger.error(err);
        }
        await utils.waitForXseconds(1);
    }
    utils.print({" SL- Hit " : tradeInstrument });
}




