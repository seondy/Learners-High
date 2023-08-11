// 강의 개설 페이지 (1페이지)
import React, {useState} from "react";

import { Box } from "@mui/material";
import { Container } from "@material-ui/core";

import ClassJoin from "../../components/class/ClassJoin";
import ClassRoundJoin from "../../components/class/ClassRoundJoin";

import Title from "../../components/common/Title";

const ClassJoinPage = () => {
    const [isLessonJoin, setIsLessonJoin] = useState(true)

    return (
        <Box sx={{ my: "4rem" }}>
            <Container maxWidth="md">
                <Title>강의 개설</Title>
                {isLessonJoin ? (
                    <ClassJoin />
                ): (
                    <ClassRoundJoin />
                )}
            </Container>
        </Box>
    );
};

export default ClassJoinPage;
