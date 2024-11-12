import { Typography } from "@mui/material";
import { DashboardLayout, PageContainer } from "@toolpad/core";

export default function IndexPage() {
    return (
        <DashboardLayout>
            <PageContainer>
                <Typography>
                    Welcome to the AirOS Toolkit, please select a page from the navigation to the left.
                    Basic function right now includes the ability to login to multiple stations at once and view basic information about them.
                </Typography>
            </PageContainer>
        </DashboardLayout>
    )
}