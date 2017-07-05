import React, { PropTypes } from 'react';
import CSSModules from 'react-css-modules';
import GoogleMap from 'google-map-react';
import {
    GOFUNDIS_STATYS_OFFLINE,
    GOFUNDIS_STATYS_ONLINE
} from 'models/googlemap';
import styles from '../styles.css';


import MapMark from '../MapMark';

import config from 'config';

const K_MARGIN_TOP = 30;
const K_MARGIN_RIGHT = 30;
const K_MARGIN_BOTTOM = 30;
const K_MARGIN_LEFT = 30;


class SegmentMapGoFundis extends React.Component {

    constructor(props) {
        super(props);
        this.getLocationSuccess = this.getLocationSuccess.bind(this);
        this.changeMapBounds = this.changeMapBounds.bind(this);
        this.renderMapMarks = this.renderMapMarks.bind(this);
        this.state = {
            data: props.data,
            mapBoundedList: [],
            currentLocation: {lat: 38.971763, lng: -97.411287},
            currentZoom: 5,
            positionIcon: 'ion-android-locate',
            showSubcriber: true,
            showGofundis: true
        };
    }

    getLocationSuccess(position) {
        this.setState({
            positionIcon: 'ion-android-locate',
            positionIconSpin: false,
            currentLocation: {lat: position.coords.latitude, lng: position.coords.longitude},
            currentZoom: 12
        });
    }

    filterArr(arr) {
        return arr.filter(item => {
            if (this.props.goFundis.all.getOrElse(false)) {
                return this.props.goFundis.all.getOrElse(false);
            } else if (item.type === GOFUNDIS_STATYS_OFFLINE) {
                return this.props.goFundis.offline.getOrElse(false);
            } else if (item.type === GOFUNDIS_STATYS_ONLINE) {
                return this.props.goFundis.online.getOrElse(false);
            }
            return false;
        });
    }

    renderMapMarks(arr) {
        return (this.filterArr(arr).map((item, idx) => (
            <MapMark
                    {...item}
                    key={idx}
                    lat={item.location.lat}
                    lng={item.location.lng} />
            )));
    }

    locationInScreen(location, nw, se) {
        return (
            (nw.lat > location.lat && location.lat > se.lat) &&
            (nw.lng < location.lng && location.lng < se.lng)
        );
    }

    changeMapBounds(newBounds) {
        let filteredList = [];
        filteredList = this.filterArr(this.state.data).filter(item => (
            this.locationInScreen(item.location, newBounds.bounds.nw, newBounds.bounds.se)
        ));
        this.setState({mapBoundedList: filteredList});
    }

    createMapOptions(maps) {
        // next props are exposed at maps
        // "Animation", "ControlPosition", "MapTypeControlStyle", "MapTypeId",
        // "NavigationControlStyle", "ScaleControlStyle", "StrokePosition", "SymbolPath", "ZoomControlStyle",
        // "DirectionsStatus", "DirectionsTravelMode", "DirectionsUnitSystem", "DistanceMatrixStatus",
        // "DistanceMatrixElementStatus", "ElevationStatus", "GeocoderLocationType", "GeocoderStatus", "KmlLayerStatus",
        // "MaxZoomStatus", "StreetViewStatus", "TransitMode", "TransitRoutePreference", "TravelMode", "UnitSystem"
        return {
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                position: maps.ControlPosition.RIGHT_BOTTOM,
                style: maps.ZoomControlStyle.SMALL
            },
            mapTypeControl: false
        };
    }
    componentWillMount() {
        // this.props.subscriberHandler(false);
        // this.props.gofundisHandler(true);
        // this.props.allHandler(false);
    }
    render() {
        return (
            <div id='map' styleName='google_map'>
                <GoogleMap id='map-component'
                           bootstrapURLKeys={{
                               key: `${config.googlemap.secret}`
                           }}
                           // experimental={false}
                           onChange={this.changeMapBounds}
                           margin={[K_MARGIN_TOP, K_MARGIN_RIGHT, K_MARGIN_BOTTOM, K_MARGIN_LEFT]}
                           center={this.state.currentLocation}
                           zoom={this.state.currentZoom}
                           options={this.createMapOptions}
                           // onChildClick={(e) => {
                           //     console.log('child click', +e, this.state.data[+e].location);
                           //     let data = this.state.data;
                           //     data[+e].showInfo = true;
                           //     this.setState({data});
                           // } }
                           // onClick={(e) => { console.log(e); } }
                           onGoogleApiLoaded={({map, maps}) => {
                               this.setState({ map, maps});
                           }}
                           yesIWantToUseGoogleMapApiInternals
                >
                    { this.renderMapMarks(this.state.data) }
                </GoogleMap>
            </div>
        );
    }
}
SegmentMapGoFundis.propTypes = {
    goFundis: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired
};

export default CSSModules(SegmentMapGoFundis, styles);
