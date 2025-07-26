import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";

const PaymentSuccess = () => {
  const { id } = useParams(); // courseId
  const navigate = useNavigate();
  const { fetchUser } = UserData();

  useEffect(() => {
    const markEnrolled = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${server}/api/course/payment/success/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Course enrolled successfully!");
        await fetchUser(); // ✅ Update user state
        navigate(`/course/${id}`); // go back to course page
      } catch (error) {
        toast.error("Something went wrong");
      }
    };

    markEnrolled();
  }, [id]);

  return (
    <div>
      <h2>Enrolling you in the course...</h2>
    </div>
  );
};

export default PaymentSuccess;
