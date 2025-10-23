import axios from "axios";

const createToken = async()=>{
    try{
        const res = await axios.post("https://accounts.zoho.com/oauth/v2/token?refresh_token=1000.597c315ad097dd27acbfe63ce1d82e48.ea1a81165b7f1bfc56c618619a3039bd&client_secret=7f606f4851e64d48437dd2a965c974e79932df8eb4&client_id=1000.Y7C03TSOIAH5MGGO422CYCMKM71VTL&redirect_uri=https://crm.zoho.in/&grant_type=refresh_token");
        const token = res.data.access_token;
        return token;
    }catch(error){
        console.log(error);
    }
}

export default createToken;