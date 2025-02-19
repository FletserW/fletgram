import { BASE_URL } from "../constants/config";

import { Post } from "../constants/types";
  

 export const toggleLikePost = async (postId: number, userId: string, setPosts: React.Dispatch<React.SetStateAction<Post[]>>) => {
    if (!userId) return;
  
    try {
      const response = await fetch(
        `${BASE_URL}/likes/${userId}/check/${postId}`
      );
      const hasLiked = await response.json();
  
      if (hasLiked) {
        const unlikeResponse = await fetch(
          `${BASE_URL}/likes/${userId}/unlike/${postId}`,
          { method: "DELETE" }
        );
  
        if (unlikeResponse.ok) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, likes: post.likes - 1 } : post
            )
          );
        } else {
          console.error("Erro ao descurtir o post");
        }
      } else {
        const likeResponse = await fetch(`${BASE_URL}/likes/${userId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId }),
        });
  
        if (likeResponse.ok) {
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === postId ? { ...post, likes: post.likes + 1 } : post
            )
          );
        } else {
          console.error("Erro ao curtir o post");
        }
      }
    } catch (error) {
      console.error("Erro ao alternar curtida:", error);
    }
  };

  