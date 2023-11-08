
const { getTrips, getDriver } = require('api');
 
/**
* This function should return the trip data analysis
*
* Question 3
* @returns {any} Trip data analysis
*/
async function analysis()
{
  try {
    // Fetches data of trips from the API
    const totalTripData = await getTrips();
    // this gives account for the cash trips and returns an array containing all cash trips which will be used later in the final result collation for the determination of the final number of cash trips
    const noOfCashTrips = totalTripData.filter((obj) => {
      return (obj.isCash === true);
    });
    // this gives account for the cash trips and returns an array containing all non cash trips which will be used later in the final result collation for the determination of the final number of non cash trips
    const noOfNonCashTrips = totalTripData.filter((obj) => {
      return (obj.isCash === false);
    });
 
    const billedTotal = totalTripData.reduce((sumTotal, obj) =>
    {
      if (typeof obj.billedAmount === 'string') {
        return sumTotal + parseFloat(obj.billedAmount.replace(/,/g, ''));
      } else if (typeof obj.billedAmount === 'number') {
        return sumTotal + obj.billedAmount;
      } else {
        return sumTotal;
      }
    }, 0);
 
    // this calculates for all the cash trips transaction and sums it up with a condition to determine if it's a string separated with commas or just a number
    const cashBilledTotal = totalTripData.reduce((sumTotal, obj) =>
    {
      if (obj.isCash === true && typeof obj.billedAmount === 'string') {
        return sumTotal + parseFloat(obj.billedAmount.replace(/,/g, ''));
      } else if (obj.isCash === true && typeof obj.billedAmount === 'number') {
        return sumTotal + obj.billedAmount;
      } else {
        return sumTotal;
      }
    }, 0);
    
    // this calculates for all the non cash trips transaction and sums it up with a condition to determine if it's a string separated with commas or just a number
    const nonCashBilledTotal = totalTripData.reduce((sumTotal, obj) =>
    {
      if (obj.isCash === false && typeof obj.billedAmount === 'string') {
        return sumTotal + parseFloat(obj.billedAmount.replace(/,/g, ''));
      } else if (obj.isCash === false && typeof obj.billedAmount === 'number') {
        return sumTotal + obj.billedAmount;
      } else {
        return sumTotal;
      }
    }, 0);
 
    // collection of all driver Ids for every trips in the tripAPI stored in an array to be used later in computation
    const driverID = totalTripData.map((obj) =>
    {
      return obj.driverID;
    })
    // this eliminates the duplicate driver Ids resulting from several trips by one driver and returns just one driver Id per driver
    const uniqueDriversIds = [...new Set(driverID)];
 
    let driversInformation = [];
    // this line iterates through the unique driver ids and takes each driver Ids as a key to fetch the driver information from the API, this returns a promise
 
    uniqueDriversIds.forEach((driver)=>
    {
      driversInformation.push(getDriver(driver))
    })
    // this line resolves all the promises
    const resolvedDriverInformation = await Promise.allSettled(driversInformation);
    // this filters the array that contains the driver information removing the error gotten from the driver with incomplete information and returns it in an array
    const driversWithCompleteInformation = resolvedDriverInformation.filter((result) => result.status === 'fulfilled').map((result) => result.value); //
    // this line accounts for the number of drivers with more than one vehicle by using the reduce method with a conditional that checks if the driver information contains a driver with more than one vehicle ID registered and returns the total number of drivers that meets this condition
 
    const noOfDriversWithMoreThanOneVehicle = driversWithCompleteInformation.reduce((sumTotal, obj) =>
    {
      if (obj.vehicleID.length > 1) {
        return sumTotal + 1;
      }  else {
        return sumTotal; // Return sumTotal as is when the condition is not met
      }
    }, 0)
 
    // starting from here
 
    let count = {};
    driverID.forEach(function(i)
    {
      count[i] = (count [i]||0) + 1;
    });
 
    const driverTripPair = Object.entries(count);
    
    // Sort the array in descending order based on values
    const sortedDriverTripPair = driverTripPair.sort((a, b) => b[1] - a[1]);
    
    const highestTripDriverId = sortedDriverTripPair[0][0];
    const  highestTripByDriver = sortedDriverTripPair[0][1];
    
    const mostTripsByDriver = {};
  
    const mostTrips = await getDriver(highestTripDriverId);
    mostTripsByDriver.name = mostTrips.name;
    mostTripsByDriver.email = mostTrips.email;
    mostTripsByDriver.phone = mostTrips.phone;
    mostTripsByDriver.noOfTrips = highestTripByDriver;
    mostTripsByDriver.totalAmountEarned = totalTripData.reduce((sumTotal, obj) =>
    {
      if (obj.driverID == highestTripDriverId && typeof obj.billedAmount === 'string') {
        return sumTotal + parseFloat(obj.billedAmount.replace(/,/g, ''));
      } else if (obj.driverID == highestTripDriverId && typeof obj.billedAmount === 'number') {
        return sumTotal + obj.billedAmount;
      } else {
        return sumTotal;
      }
    }, 0)
  
    const driverTotalAmounts = [];
  
    // Loop through unique drivers
    for (const key of uniqueDriversIds) {
      const driverTrips = totalTripData.filter((trip) => trip.driverID === key);
    
      // Calculate the total billed amount and number of trips for this driver
      const totalAmountEarned = driverTrips.reduce(
        (sumTotal, obj) => {
          if (typeof obj.billedAmount === 'string') {
            return sumTotal + parseFloat(obj.billedAmount.replace(/,/g, ''));
          } else if (typeof obj.billedAmount === 'number') {
            return sumTotal + obj.billedAmount;
          } else {
            return sumTotal;
          }
        }, 0);
  
      const noOfTrips = driverTrips.reduce((trip) => {
        return driverTrips.length
      }, 0)
        
    driverTotalAmounts.push({
      driverID: key,
      totalAmount: totalAmountEarned,
      noOfTrips: noOfTrips,
    });
  }
 
  driverTotalAmounts.sort((a, b) => b.totalAmount - a.totalAmount);
  
  // after sorting in descending order, the highest earning driver is the driver at index 0
  const highestEarningDriverInfo = driverTotalAmounts[0].driverID;
  
  // Retrieve the driversInformation of the highest-earning driver
  const highestEarning = await getDriver(highestEarningDriverInfo);
  
  let highestEarningDriver = {
    name: highestEarning.name,
    email: highestEarning.email,
    phone: highestEarning.phone,
    noOfTrips: driverTotalAmounts[0].noOfTrips,
    totalAmountEarned: driverTotalAmounts[0].totalAmount,
  };
    
    const output = {
      noOfCashTrips: noOfCashTrips.length,
      noOfNonCashTrips: noOfNonCashTrips.length,
      billedTotal: parseFloat(billedTotal.toFixed(2)),
      cashBilledTotal,
      nonCashBilledTotal: parseFloat(nonCashBilledTotal.toFixed(2)),
      noOfDriversWithMoreThanOneVehicle,
      mostTripsByDriver,
      highestEarningDriver
    }
    
    return output;
 
  } catch (error) {
    console.error('Error fetching trip data:', error)
  }
}
 
console.log(analysis());
 
module.exports = analysis;