import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, ScrollView, TouchableHighlight, Image, Dimensions, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Card, Text, Button, Icon } from 'react-native-elements';
import { ActionCreators } from '../actions';
import { Constants } from 'expo';
import MiniCard from '../components/MiniCard';
import CatagoryCard from '../components/CatagoryCard';
import SearchBox from '../components/SearchBox';
import { FloatingAction } from 'react-native-floating-action';
import call from 'react-native-phone-call'
import Colors from '../constants/colors';
import _ from 'lodash';

const window = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  Header: {
    color: '#34495e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  image: {
    flex: 1,
    width: 60,
    height: 100,
    resizeMode: 'contain',
  },
  more: {
    paddingRight: 10,
    color: 'grey',
  },
  LongButton: {
    backgroundColor: '#EF5350',
    width: window.width * 0.9,
    height: 70,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  Wrapper: {
    backgroundColor: '#FFFFFF',
    height: window.height * 0.3,
    width: window.width * 0.8,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  miniCard: {
    backgroundColor: 'white',
    width: 140,
    height: 170,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 20,
    paddingBottom: 10,
  },
  miniImage: {
    width: 137,
    height: 80,
    alignSelf: 'center',
    borderRadius: 3,
  },
  miniTypeHeader: {
    color: '#1ABC9C',
    fontSize: 10,
  },
  miniHeader: {
    color: '#34495e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  miniMain: {
    color: '#95a5a6',
    fontSize: 10,
  },
  navBar: {
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  navButton: {
      shadowColor: 'grey',
      shadowRadius: 4, 
      shadowOpacity: 0.5,
      shadowOffset:{width:0,height:0},
      backgroundColor: 'white',
      borderColor: '#CFD8DC',
      borderWidth: 1,
      borderRadius: 2,

  },
});

const actions = [{
  text: 'เจ็บป่วยฉุกเฉิน',
  icon: <Icon name="ambulance" type='font-awesome' color="white" />,
  name: 'ambulance',
  position: 3,
  color: Colors.red,
},
{
  text: 'เหตุด่วนเหตุร้าย',
  icon: <Icon name="taxi" type='font-awesome' color="white" />,
  name: 'police',
  position: 2,
  color: Colors.red,
},
{
  text: 'เหตุไฟไหม้รถดับเพลิง',
  icon: <Icon name="fire-extinguisher" type='font-awesome' color="white" />,
  name: 'fire',
  position: 1,
  color: Colors.red,
},
];

class MainScreen extends React.Component {
  static navigationOptions = { header: null };

  state = {
    visible: true,
    modalVisible: false,
  };

  componentDidMount() {
    this.props.userProfileFetch()
    this.props.fetch_saved()
  }

  handleMap = () => {
    this.setState({ modalVisible: true })
    this.props.announcedFetch()
  }
  handleMapSecond = () => {
    this.setState({ modalVisible: false })
    this.props.navigation.navigate('MapAnnoucedScreen')
  }

  handleCreate = () => {
    this.setState({ modalVisible: false })
    this.props.navigation.navigate('AnnouncedScreen')
  }

  handleRequest = (item) => {
    this.props.requestFetchAccepted(item.uid)
    this.props.navigation.navigate('RequestView', {
      item: item, save: "Save"
    })
  }

  render() {
    const { visible, modalVisible } = this.state;
    return (
      <View style={styles.container}>
        <Modal
          transparent={true}
          animationType={'slide'}
          visible={modalVisible}
          onRequestClose={() => { console.log('close modal') }}>
          <View style={styles.modalBackground}>
            <View style={styles.Wrapper}>
              <Button
                buttonStyle={{ borderRadius: 6, width: window.width * 0.5, }}
                backgroundColor={Colors.mintColor}
                fontWeight='bold'
                color='white'
                title='Map'
                onPress={this.handleMapSecond} />
              <Button
                buttonStyle={{ borderRadius: 6, width: window.width * 0.5, }}
                backgroundColor={Colors.mintColor}
                fontWeight='bold'
                color='white'
                title='Create Announce'
                onPress={this.handleCreate} />
            </View>
          </View>
        </Modal>
        <View style={styles.navBar}>
          <Button
            buttonStyle={styles.navButton}
            onPress={() => this.props.navigation.navigate('SearchScreen')}
            backgroundColor='white'
            color='grey'
            iconLeft
            icon={{ name: 'search', color: 'grey', }}
            title='Try "Official"' />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingLeft: 20 }}
          onScrollBeginDrag={() => this.setState({
            visible: false
          })}
          onScrollEndDrag={() => this.setState({
            visible: true
          })}
        ><View style={{ paddingBottom: 20, paddingTop: 20 }}>
            <TouchableOpacity style={styles.LongButton} onPress={this.handleMap}>
              {/* <Image source={require('../../assets/Test.jpeg')} style={styles.image} resizeMode="stretch" /> */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <Text style={{ color: "white", fontSize: 30, fontWeight: "bold" }}>Map</Text>
              </View>
            </TouchableOpacity>
          </View>
          {this.props.requestSaved &&
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
              <Text style={styles.Header}>Saved</Text>
            </View>
          }
          <FlatList
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            data={this.props.requestSaved}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.miniCard}
                onPress={() => this.handleRequest(item)}>
                <Image source={{ uri: item.imageUrl }} style={styles.miniImage} resizeMode="stretch" />
                <Text style={styles.miniTypeHeader}>{item.type}</Text>
                <Text style={styles.miniHeader}>{((item.topic).length > 20) ?
                  (((item.topic).substring(0, 20 - 3)) + '...') :
                  item.topic}</Text>
                <Text style={styles.miniMain}>
                  {((item.detail).length > 40) ?
                    (((item.detail).substring(0, 40 - 3)) + '...') :
                    item.detail}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.uid}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
            <View>
              <Text style={styles.Header}>Event</Text>
            </View>
          </View>
          <View style={{ paddingRight: 20 }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.props.requestArray}
              renderItem={({ item }) => (
                <TouchableOpacity style={{ paddingTop: 5, paddingBottom: 10 }}
                  onPress={() => this.handleRequest(item)}>
                  <Image resizeMode={"cover"}
                    source={{ uri: item.imageUrl }}
                    style={{ height: window.height * 0.3, borderRadius: 3, }} />
                  <Text style={{ color: Colors.mintColor, fontSize: 12, fontWeight: 'bold', paddingTop: 8 }}>{item.type}</Text>
                  <Text style={{ color: Colors.grey1, fontSize: 20, fontWeight: 'bold', paddingTop: 3 }}>{item.topic}</Text>
                  <Text style={{ color: Colors.grey1, fontSize: 12, paddingTop: 3 }}>{item.heroAccepted}/{item.hero} persons</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.uid}
            />
          </View>
        </ScrollView>
        <FloatingAction
          visible={visible}
          actions={actions}
          distanceToEdge={10}
          buttonColor={Colors.red}
          onPressItem={
            (name) => {
              switch (name) {
                case "ambulance":
                  call({
                    number: '1669',
                    prompt: false
                  }).catch(console.error)
                  break;
                case "police":
                  call({
                    number: '191',
                    prompt: false
                  }).catch(console.error)
                  break;
                case "fire":
                  call({
                    number: '199',
                    prompt: false
                  }).catch(console.error)
                  break;
                default:
                  console.log(`selected button: ${name}`)
              }
            }
          }
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { requestEvent } = state.requestForm;
  const requestArray = _.map(requestEvent, (val, uid) => {
    return { ...val, uid };
  });
  const { requestSaved } = state.requestForm;
  return { user: state.auth.user, userProfileObject: state.userForm, requestEvent, requestArray, requestSaved };
};

MainScreen.propTypes = {
  user: React.PropTypes.object.isRequired,
  logout: React.PropTypes.func.isRequired,
};

export default connect(mapStateToProps, ActionCreators)(MainScreen);