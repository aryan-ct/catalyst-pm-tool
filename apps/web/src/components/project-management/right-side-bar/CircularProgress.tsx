import {CircularProgressbar} from "react-circular-progressbar";

const CircularProgress = () => {
    const percentage=66;
    const primaryColor="#15a25e"
  return (
   <CircularProgressbar value={percentage} styles={{
    path:{
        stroke:primaryColor,
        strokeLinecap:"round",
        transition:"stroke-dashoffset 0.5s ease 0s",
    },
    trail:{
        stroke:"#e2e8f0"
    },
    text:{
        fill:primaryColor,
        fontSize:"16px"
    }
   }}
   text={`${percentage}%`}/>
  )
}

export default CircularProgress