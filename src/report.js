const { getTrips } = require('api');

/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {Promise<any>} Driver report data
 */


async function driverReport() {
  try {
    const trips = await getTrips();
    console.log(trips);
 
    // initialize empty object to store final output
    const driversReport = {};
 
    for(let trip of trips){
 
      const driverID = trip.driverID;
      if(!driversReport[driverID]){
 
        const driverInfo = await getDriver(driverID)
 
        driversReport[driverID] = {
 
          fullName: driverInfo.fullName,
          id: driverID,
          phone: driverInfo.phone,
          noOfTrips: 0,
          noOfVehicles: 0,
          vehicles: [],
          noOfCashTrips: 0,
          noOfNonCashTrips: 0,
          totalAmountEarned: 0,
          totalCashAmount: 0,
          totalNonCashAmount: 0,
          trips: []
        }
        
      }
      driversReport[driverID].noOfTrips ++;
      driversReport[driverID].totalAmountEarned += trip.billedAmount;
 
      if(trip.isCash === true){
        driversReport[driverID].noOfCashTrips++;
        driversReport[driverID].totalCashAmount += trip.billedAmount;
      }
      else{
        driversReport[driverID].noOfNonCashTrips++;
        driversReport[driverID].totalNonCashAmount += trip.billedAmount;
      }
 
      // populate the trip's details to the driver's report - category (trips)
      driversReport[driverID].trips.push({
        user: trip.user.name,
        created: trip.created,
        pickup: trip.pickup.address,
        destination: trip.destination.address,
        billed: trip.billedAmount,
        isCash: trip.isCash,
      })
 
      //get vehicle information for each driver
 
      for(let driverID in driversReport){
        const driverInfo = await getDriver(driverID)
 
        driversReport[driverID].noOfVehicles = driverInfo.vehicleID.length;
      }
      //extract vehicle information for each driverID
 
      for (let vehicleID of driverInfo.vehicleID){
        const vehicleInfo = await getVehicle(vehicleID)
 
        driversReport[driverID].vehicles.push({
          plate: vehicleInfo.plate,
          manufacturer: vehicleInfo.manufacturer,
        })
 
      }
 
    }
 
    const outputArray = Object.values(driversReport)
 
    //return outputArray;
 
    //console.log(outputArray)
 
 
  } catch (error) {
    throw error
  }
} 
  module.exports = driverReport;