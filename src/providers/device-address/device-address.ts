import { Injectable } from '@angular/core';

@Injectable()
export class DeviceAddressProvider {

  constructor() { }

  /**
   * This function attempts to return the device's
   * internal IP address. Once determined, the
   * promise resolves to the address.
   */
  getUserIP() {
    const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;

    let myPeerConnection,
      pc,
      noop,
      localIPs;

    myPeerConnection = (<any>window).RTCPeerConnection || (<any>window).mozRTCPeerConnection || (<any>window).webkitRTCPeerConnection;
    pc = new myPeerConnection({ iceServers: [] });
    noop = function () { };
    localIPs = {};

    return new Promise((resolve, reject) => {
      pc.createDataChannel('');
      pc.createOffer().then(function (sdp) {
        sdp.sdp.split('\n').forEach(function (line) {
          if (line.indexOf('candidate') < 0) return;
          line.match(ipRegex).forEach(iterateIP);
        });

        pc.setLocalDescription(sdp, noop, noop);
      }).catch(function (reason) {
        reject('');
      });

      pc.onicecandidate = function (ice) {
        if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
        ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
      };

      function iterateIP(ip) {
        if (!localIPs[ip]) {
          resolve(ip);
        }
      }
    });
  }

}
