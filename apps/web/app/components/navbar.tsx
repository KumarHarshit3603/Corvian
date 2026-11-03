export default function Navbar(){
    return(
        <>
            <div className="flex h-20 text-white justify-between">
                <div className="flex justify-between w-1/3">
                    <div className="p-5 bg-[url('/corvian_logo.svg')]"></div>
                    <div className="flex">
                        <div className="p-5 hover:text-[#FF9D45]">Trade</div>
                        <div className="p-5 hover:text-[#FF9D45]">Markets</div>
                        <div className="p-5 hover:text-[#FF9D45]">Earn</div>
                        <div className="p-5 hover:text-[#FF9D45]">More</div>
                    </div>
                </div>
                <div className="flex h-50">
                    <div className="p-5">
                        <input placeholder="Search..." className="p-2 rounded-3xl bg-[#151F2E]"></input>
                    </div>
                    <div className="p-5">notification</div>
                    <div className="p-5">Account</div>
                </div>
            </div>
        </>
    )
}