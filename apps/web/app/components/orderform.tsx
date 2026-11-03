export default function Orderform(){
    return(
        <>
           <div className="bg-[#0D1421] w-xl border-[#202C3D] border rounded-lg text-[#E6EDF7]">
                <button className="py-5 bg-[#26a69a] rounded-xl m-2 w-1/2">Buy</button>
                <button className="py-5 bg-[#151F2E] rounded-xl m-2 w-1/2">Sell</button>
                <div>
                    <div className="text-[#94A3B8] text-lg">Price</div>
                    <input className="bg-[#151F2E] py-5  rounded-lg w-full m-2"></input>
                </div>
                <div>
                    <div className="text-[#94A3B8] text-lg">Amount</div>
                    <input className="bg-[#151F2E] py-5  rounded-lg w-full m-2"></input>
                </div>
                <div>
                    <div className="text-[#94A3B8] text-lg">Total</div>
                    <input className="bg-[#151F2E] py-5  rounded-lg w-full m-2"></input>
                </div>
                <button className="px-15 py-5 bg-[#26a69a] rounded-xl w-full m-2">Buy</button>
           </div>
        </>
    )
}