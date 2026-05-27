const config = require('../config');
const logger = require('../config/logger');

async function optimizeRoute(orders, driver, store) {
  if (!config.google.routeOptimizationKey || config.env === 'development') {
    return mockRouteOptimization(orders, driver, store);
  }

  const shipments = orders.map((order, idx) => ({
    label: order.orderNumber || `Order-${idx}`,
    deliveries: [{
      arrivalWaypoint: {
        location: {
          latLng: {
            latitude: Number(order.deliveryLat || order.lat || 20.5937),
            longitude: Number(order.deliveryLng || order.lng || 78.9629),
          },
        },
      },
      duration: '180s',
      timeWindows: [{
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      }],
    }],
    loadDemands: {
      weight_kg: { amount: String(order.estimatedWeightKg || 2) },
    },
  }));

  const vehicle = {
    label: driver.name,
    startWaypoint: {
      location: {
        latLng: {
          latitude: store.lat || 20.5937,
          longitude: store.lng || 78.9629,
        },
      },
    },
    endWaypoint: {
      location: {
        latLng: {
          latitude: store.lat || 20.5937,
          longitude: store.lng || 78.9629,
        },
      },
    },
    loadLimits: {
      weight_kg: { maxLoad: String(driver.vehicleCapacityKg || 50) },
    },
    costPerKilometer: 1,
  };

  try {
    const response = await fetch(
      `https://routeoptimization.googleapis.com/v1/projects/${config.google.projectId}:optimizeTours`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.google.routeOptimizationKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shipments, vehicles: [vehicle] }),
      }
    );

    if (!response.ok) {
      throw new Error(`Route optimization API error: ${response.status}`);
    }

    const data = await response.json();
    return parseRouteResponse(data, orders);
  } catch (error) {
    logger.error(`Route optimization failed: ${error.message}`);
    return mockRouteOptimization(orders, driver, store);
  }
}

function parseRouteResponse(data, orders) {
  const routes = data.routes?.[0] || {};

  const waypoints = (routes.visits || []).map((visit, idx) => {
    const order = orders[idx] || {};
    return {
      stopSequence: idx + 1,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      address: order.deliveryAddress,
      lat: visit.delivery?.arrivalWaypoint?.location?.latLng?.latitude || order.lat,
      lng: visit.delivery?.arrivalWaypoint?.location?.latLng?.longitude || order.lng,
      estimatedArrival: visit.delivery?.arrivalTime,
      estimatedDuration: visit.delivery?.duration?.replace('s', '') || '180',
    };
  });

  return {
    waypoints,
    totalDistanceKm: routes.totalDistanceKm || parseFloat(routes.totalDistance || '0') / 1000,
    estimatedDurationMin: routes.totalDuration
      ? Math.round(parseInt(routes.totalDuration.replace('s', '')) / 60)
      : waypoints.length * 10,
    totalCost: routes.totalCost || 0,
  };
}

function mockRouteOptimization(orders, driver, store) {
  const waypoints = orders.map((order, idx) => ({
    stopSequence: idx + 1,
    orderId: order.id,
    orderNumber: order.orderNumber || `KF-${idx}`,
    customerName: order.customerName || order.customer?.name || 'Customer',
    address: order.deliveryAddress || order.address,
    lat: Number(order.deliveryLat || order.lat || 20.5937 + idx * 0.01),
    lng: Number(order.deliveryLng || order.lng || 78.9629 + idx * 0.01),
    estimatedArrival: new Date(Date.now() + (idx + 1) * 15 * 60 * 1000).toISOString(),
    estimatedDuration: '180',
  }));

  return {
    waypoints,
    totalDistanceKm: orders.length * 1.5,
    estimatedDurationMin: orders.length * 12,
    totalCost: orders.length * 5,
  };
}

async function getDirections(originLat, originLng, destLat, destLng, waypoints = []) {
  if (!config.google.mapsApiKey) {
    return mockDirections();
  }

  const waypointStr = waypoints
    .map((w) => `via:${w.lat},${w.lng}`)
    .join('|');

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}${waypointStr ? `&waypoints=${waypointStr}` : ''}&key=${config.google.mapsApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Directions API: ${data.status}`);
    }

    const route = data.routes[0];
    return {
      polyline: route.overview_polyline.points,
      distance: route.legs.reduce((s, l) => s + l.distance.value, 0),
      duration: route.legs.reduce((s, l) => s + l.duration.value, 0),
      legs: route.legs.map((leg) => ({
        startAddress: leg.start_address,
        endAddress: leg.end_address,
        distance: leg.distance.text,
        duration: leg.duration.text,
        steps: leg.steps.map((s) => ({
          instruction: s.html_instructions.replace(/<[^>]*>/g, ''),
          distance: s.distance.text,
          duration: s.duration.text,
        })),
      })),
    };
  } catch (error) {
    logger.error(`Directions API error: ${error.message}`);
    return mockDirections();
  }
}

function mockDirections() {
  return {
    polyline: 'mock_polyline_data',
    distance: 5000,
    duration: 1200,
    legs: [{ startAddress: 'Store', endAddress: 'Customer', distance: '5 km', duration: '20 mins', steps: [] }],
  };
}

module.exports = { optimizeRoute, getDirections, parseRouteResponse };
