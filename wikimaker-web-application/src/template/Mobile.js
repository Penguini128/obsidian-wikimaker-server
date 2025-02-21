import {useEffect, useState} from "react";

const MOBILE_WIDTH = 1100

const useMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_WIDTH);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
    })
    const handleResize = () => {
        setIsMobile(window.innerWidth < MOBILE_WIDTH);
    }
    return isMobile
}

export default useMobile;