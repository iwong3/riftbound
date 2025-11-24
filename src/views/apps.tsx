import { Box } from '@mui/material'

export enum App {
    PointsCounter = 'Points Counter',
}

const apps = [App.PointsCounter]

type AppsProps = {
    onAppSelect: (app: string) => void;
}

export const Apps = ({ onAppSelect }: AppsProps) => {
    const handleAppClick = (app: App) => {
        onAppSelect(app)
    }

    const renderApps = () => {
        const renderApps = []
        let row = []
        const rowLength = 2

        for (let i = 0; i < apps.length; i++) {
            row.push(renderApp(apps[i]))

            if (row.length === rowLength || i === apps.length - 1) {
                renderApps.push(
                    <Box
                        key={'app-row-' + renderApps.length}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 1,
                            width: '100%',
                        }}>
                        {row}
                    </Box>
                )
                row = []
            }
        }

        return renderApps
    }

    const renderApp = (app: App) => {
        const key = 'app-' + app

        return (
            <Box
                key={key}
                onClick={() => handleAppClick(app)}
                sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: 2,
                    width: '39%',
                    height: window.innerHeight * 0.1,
                    border: '1px solid #FBBC04',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    boxShadow: 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px',
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    },
                    transition: 'background-color 0.2s ease-out',
                }}>
                {app}
            </Box>
        )
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginX: 2,
                marginTop: 2,
                width: '100%',
                height: '100%',
            }}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 2,
                    width: '100%',
                    fontSize: 24,
                    fontFamily: 'Spectral',
                }}>
                Apps
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    marginBottom: 2,
                }}>
                {renderApps()}
            </Box>
        </Box>
    )
}

