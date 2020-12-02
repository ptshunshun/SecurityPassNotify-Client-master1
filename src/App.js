import React, { useState, useEffect } from 'react';
// import './App.css';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';
import CssBaseline from '@material-ui/core/CssBaseline'
import theme from './theme';
import Fab from '@material-ui/core/Fab';
import { saveIfNotExist, getAllRecordsInFirestoreCollection } from './firestore'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import GitHubIcon from '@material-ui/icons/GitHub';
import Link from '@material-ui/core/Link';
import {liffConfig} from './config';
const useStyles = makeStyles(theme => ({

  root: {
    // textAlign: 'center',
    // flexGrow: 1,
    // marginTop: theme.spacing(5),
    // marginBottom:theme.spacing(3)
  },
  buttonDesc: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    textAlign: 'left',
  },
  buttonArea: {
    margin: theme.spacing(3),
  },
  buttonCap: {
    textAlign: 'left',
    marginTop: theme.spacing(6),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
  table: {
    padding: theme.spacing(3),
  },
  tableTitle: {
    paddingBottom: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  github:{
    fontSize:15,
    marginRight:theme.spacing(1),
  }
}));



const liff = window.liff

function App() {
  const classes = useStyles();
  const [profile, setProfile] = useState({});
  const [checkedMembers, setCheckedMembers] = useState([]);
  const [open, setOpen] = React.useState(false);
  // set this into the env variable
  const myliffId = liffConfig.liffId;
  useEffect(() => {
    liff.init({ liffId: myliffId })
      .then(() => {
        // start to use LIFF's api
        initializeApp();
      })
      .catch((err) => {
        window.alert(err);
      });
  }, []);

  const initializeApp = () => {
    liff.getProfile()
      .then(prof => setProfile(prof));

    getAllRecordsInFirestoreCollection(getCollectionName())
      .then(records => {
        const members = [];

        records.docs.map(doc => {
          members.push({
            displayName: doc._document.proto.fields.displayName.stringValue,
            pictureUrl: doc._document.proto.fields.pictureUrl.stringValue,
            checkedAt: doc._document.proto.fields.checkedAt.stringValue
          })
        })

        setCheckedMembers(members);

      })

  }

  const getCollectionName = () => {
    //example '2020-1-1st'
    const date = new Date();
    const week = Math.floor((date.getDate() - date.getDay() + 12) / 7);
    let suf = '';
    if (week === 1) { suf = 'st' }
    else if (week === 3) { suf = 'rd' }
    else { suf = 'th' }

    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + week + suf;

  }

  const confirmICheckedPass = () => {
    setOpen(!open);

    saveIfNotExist(
      profile.userId,
      {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      },
      getCollectionName()
    ).then(result => {
      if (result === false) {
        setOpen(false);
        window.alert("あなたは確認済みです。")
      } else {
        getAllRecordsInFirestoreCollection(getCollectionName())
          .then(records => {
            const members = [];

            records.docs.map(doc => {
              members.push({
                displayName: doc._document.proto.fields.displayName.stringValue,
                pictureUrl: doc._document.proto.fields.pictureUrl.stringValue,
                checkedAt: doc._document.proto.fields.checkedAt.stringValue
              })
            })

            setCheckedMembers(members);

          })
          setOpen(false)
          window.alert("確認が完了しました。");
          fetch('https://mysterious-bastion-30763.herokuapp.com/islast',
          {
            methos:'POST',
            body:{}
          })   
      }
    })

  }
  const getToday = () => {
    const dayOfWeekStr = ["日", "月", "火", "水", "木", "金", "土"]
    const date = new Date();
    const formattedDate = `
    ${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}(${dayOfWeekStr[date.getDay()]})`.replace(/\n|\r/g, '');

    return formattedDate;
  }
  return (
    <div className="App" className={classes.root}>
      <ThemeProvider theme={theme}>
      


        <CssBaseline />

        <Grid
          direction="column"
          justify="flex-start"
          alignItems="center"
          spacing={2}>
            
          
          <Grid className={classes.topTxt}>
        <Typography variant="h4">{getCollectionName()}</Typography>
        <Typography variant="h6">Today : {getToday()}</Typography>
          </Grid>
          <div className="confirmButtonArea">
            <Grid item xs={12} className={classes.buttonArea}>
              <Typography variant="body2" display="block" className={classes.buttonDesc} gutterBottom>
                週末の帰宅後、手元に入館証があることを確認してから、ボタンを押してください。
              </Typography>
              <Fab
                variant="extended"
                color="primary"
                aria-label="add"
                onClick={confirmICheckedPass}
                className={classes.button}
              >
                <CheckIcon />
                入館証を確認しました。
                </Fab>
              <Typography variant="caption" display="block" className={classes.buttonCap}>
                {/* <WarningIcon style={{ fontSize: 15}} /> */}
                ※日曜日になったらリセットされるので、金曜日か土曜日のうちに確認を済ますようにしてください。
                </Typography>
            </Grid>
          </div>

          {/* progress circul */}
          <Backdrop
            className={classes.backdrop}
            open={open}
            // onClick={() => {
            //   setOpen(false);
            // }}
          >

            <CircularProgress color="inherit" />
          </Backdrop>
          <div className="checkedMembersList">
            <Grid item xs={12} className={classes.table}>
              <Typography className={classes.tableTitle}>
                確認した人一覧
           </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    {checkedMembers.map(member => (

                      <TableRow key={member.displayName}>
                        {/* icon */}
                        <TableCell align="center" component="th" scope="row">
                          <Avatar alt={member.displayName} src={member.pictureUrl} />
                        </TableCell>
                        {/* name */}
                        <TableCell align="center">
                          {member.displayName}
                        </TableCell>
                        {/* date */}
                        <TableCell align="right">{member.checkedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </div>
        </Grid>
        
      </ThemeProvider>
    </div>
  );
}

export default App;
