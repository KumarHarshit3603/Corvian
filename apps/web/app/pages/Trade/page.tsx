import CandlestickChart from "@/app/components/candlestickChart"
import Orderbook from "@/app/components/orderbook"
import Orderform from "@/app/components/orderform"
import Navbar from "@/app/components/navbar"
export default function Trade(){
    return(
        <>
            <div className="bg-[#080E18]">
                <Navbar/>
                <div className="flex flex-wrap">
                    <CandlestickChart/>
                    <Orderbook/>
                    <Orderform/>
                </div>
            </div>
        </>
    )
}