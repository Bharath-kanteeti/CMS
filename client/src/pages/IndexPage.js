import { useEffect,useState } from "react";
import Post from "../post";
export default function IndexPage() {
    const[posts,setPosts]=useState([]);
    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/post`).then(response => {
        //fetch('http://localhost:4000/post').then(response => {
          response.json().then(posts=>{
          setPosts(posts);
          });
        });
    }, []);
    return (
        <>
        {posts.length>0 && posts.map(post => (
            <Post {...post} />
        ))} 
        </>
    );
}