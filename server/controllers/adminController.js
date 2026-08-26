
const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');
const Route = require('../models/Route');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const SeatChangeHistory = require('../models/SeatChangeHistory');
const asyncHandler = require('../utils/asyncHandler');

/*
|--------------------------------------------------------------------------
| Helper: Safely get a value
|--------------------------------------------------------------------------
*/

const safeString = (value, fallback = '') => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  return String(value);
};

/*
|--------------------------------------------------------------------------
| Helper: Format Bus for frontend
|--------------------------------------------------------------------------
*/

function formatBusForFrontend(bus) {
  if (!bus) {
    return null;
  }

  const doc = bus.toObject ? bus.toObject() : bus;

  return {
    id: doc._id,
    _id: doc._id,

    operator: doc.operatorName || '',
    operatorName: doc.operatorName || '',

    busNumber: doc.busNumber || '',
    busType: doc.busType || '',

    registrationNumber: doc.registrationNumber || '',

    route: {
      from: doc.boardingPoints?.[0] || '',
      to: doc.droppingPoints?.[0] || ''
    },

    totalSeats: doc.seatConfiguration?.totalSeats || 0,

    seatConfiguration: doc.seatConfiguration || {
      rows: 0,
      columns: 0,
      aisleAfter: 0,
      totalSeats: 0
    },

    amenities: Array.isArray(doc.amenities)
      ? doc.amenities
      : [],

    boardingPoints: Array.isArray(doc.boardingPoints)
      ? doc.boardingPoints
      : [],

    droppingPoints: Array.isArray(doc.droppingPoints)
      ? doc.droppingPoints
      : [],

    status: doc.isActive ? 'active' : 'inactive',
    isActive: Boolean(doc.isActive),

    rating: doc.rating || 0,

    createdAt: doc.createdAt || null
  };
}

/*
|--------------------------------------------------------------------------
| ADMIN DASHBOARD
|--------------------------------------------------------------------------
|
| GET /api/admin/dashboard
| Private/Admin
|
*/

exports.getDashboard = asyncHandler(async (req, res, next) => {
  /*
   * Start of today
   */
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  /*
   * Run independent database queries in parallel.
   */
  const [
    totalBuses,
    activeBuses,
    totalPassengers,
    todayBookings,
    confirmedBookings,
    cancelledBookings,
    seatChanges,
    smartSeatNotifications,
    recentBookings,
    recentNotifications,
    popularRoutes
  ] = await Promise.all([
    /*
     * Bus statistics
     */
    Bus.countDocuments(),

    Bus.countDocuments({
      isActive: true
    }),

    /*
     * Passenger statistics
     */
    User.countDocuments({
      role: 'passenger'
    }),

    /*
     * Today's bookings
     */
    Booking.countDocuments({
      createdAt: {
        $gte: today
      }
    }),

    /*
     * Confirmed bookings
     */
    Booking.countDocuments({
      bookingStatus: 'confirmed'
    }),

    /*
     * Cancelled bookings
     */
    Booking.countDocuments({
      bookingStatus: 'cancelled'
    }),

    /*
     * Seat changes
     */
    SeatChangeHistory.countDocuments(),

    /*
     * Smart seat notifications
     */
    Notification.countDocuments({
      type: 'adjacent_seat'
    }),

    /*
     * Recent bookings
     *
     * IMPORTANT:
     * We use lean() so the result is plain objects.
     */
    Booking.find()
      .populate({
        path: 'userId',
        select: 'name email',
        options: {
          strictPopulate: false
        }
      })
      .populate({
        path: 'busId',
        select: 'busNumber operatorName',
        options: {
          strictPopulate: false
        }
      })
      .sort({
        createdAt: -1
      })
      .limit(5)
      .lean(),

    /*
     * Recent notifications
     *
     * userId may be null if the referenced user was deleted.
     * We handle that below.
     */
    Notification.find()
      .populate({
        path: 'userId',
        select: 'name email',
        options: {
          strictPopulate: false
        }
      })
      .sort({
        createdAt: -1
      })
      .limit(5)
      .lean(),

    /*
     * Popular routes
     */
    Booking.aggregate([
      {
        $match: {
          routeId: {
            $ne: null
          }
        }
      },

      {
        $group: {
          _id: '$routeId',

          bookings: {
            $sum: 1
          },

          revenue: {
            $sum: {
              $ifNull: ['$fare', 0]
            }
          }
        }
      },

      {
        $sort: {
          bookings: -1
        }
      },

      {
        $limit: 5
      }
    ])
  ]);

  /*
  |--------------------------------------------------------------------------
  | Populate routes safely
  |--------------------------------------------------------------------------
  */

  let routePerformance = [];

  if (Array.isArray(popularRoutes) && popularRoutes.length > 0) {
    try {
      routePerformance = await Route.populate(popularRoutes, {
        path: '_id',
        model: 'Route'
      });
    } catch (routeError) {
      console.error(
        'Dashboard route population error:',
        routeError.message
      );

      /*
       * Do not fail the complete dashboard just because
       * one route reference is invalid.
       */
      routePerformance = popularRoutes;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Format recent bookings
  |--------------------------------------------------------------------------
  */

  const formattedRecentBookings = Array.isArray(recentBookings)
    ? recentBookings.map((booking) => {
        /*
         * userId can be null.
         */
        const userName =
          booking?.userId?.name ||
          booking?.passengerDetails?.name ||
          'Unknown Passenger';

        /*
         * busId can be null.
         */
        const busNumber =
          booking?.busId?.busNumber ||
          'Unknown Bus';

        return {
          id:
            booking?.bookingId ||
            booking?._id ||
            null,

          passenger: userName,

          bus: busNumber,

          seat:
            booking?.seatNumber ||
            'N/A',

          amount:
            Number(booking?.fare) || 0,

          status:
            booking?.bookingStatus ||
            'unknown',

          createdAt:
            booking?.createdAt ||
            null
        };
      })
    : [];

  /*
  |--------------------------------------------------------------------------
  | Format recent notifications
  |--------------------------------------------------------------------------
  */

  const formattedRecentNotifications =
    Array.isArray(recentNotifications)
      ? recentNotifications.map((notification) => {
          /*
           * IMPORTANT:
           *
           * notification.userId may be null.
           *
           * NEVER do:
           *
           * notification.userId.name
           *
           * because that causes:
           *
           * Cannot read properties of null (reading 'name')
           */

          const recipientName =
            (notification?.userId && notification.userId.name) ||
            (notification?.userId && notification.userId.email) ||
            'Unknown User';

          return {
            id:
              notification?._id ||
              null,

            recipient:
              recipientName,

            message:
              notification?.message ||
              '',

            type:
              notification?.type ||
              'general',

            read:
              Boolean(notification?.read),

            time:
              notification?.createdAt ||
              null
          };
        })
      : [];

  /*
  |--------------------------------------------------------------------------
  | Format popular routes
  |--------------------------------------------------------------------------
  */

  const formattedPopularRoutes =
    Array.isArray(routePerformance)
      ? routePerformance
          .filter((route) => route)
          .map((route) => {
            /*
             * After Route.populate(), route._id may be:
             *
             * 1. A Route document
             * 2. null
             * 3. An ObjectId
             *
             * Handle all cases safely.
             */

            const routeDocument =
              route?._id &&
              typeof route._id === 'object' &&
              (
                route._id.source !== undefined ||
                route._id.destination !== undefined
              )
                ? route._id
                : null;

            return {
              from:
                routeDocument?.source ||
                'Unknown',

              to:
                routeDocument?.destination ||
                'Unknown',

              bookings:
                Number(route?.bookings) || 0,

              revenue:
                Number(route?.revenue) || 0
            };
          })
      : [];

  /*
  |--------------------------------------------------------------------------
  | Final dashboard response
  |--------------------------------------------------------------------------
  */

  return res.status(200).json({
    success: true,

    data: {
      overview: {
        totalBuses:
          Number(totalBuses) || 0,

        activeBuses:
          Number(activeBuses) || 0,

        totalPassengers:
          Number(totalPassengers) || 0,

        todayBookings:
          Number(todayBookings) || 0,

        confirmedBookings:
          Number(confirmedBookings) || 0,

        cancelledBookings:
          Number(cancelledBookings) || 0,

        seatChanges:
          Number(seatChanges) || 0,

        smartSeatNotifications:
          Number(smartSeatNotifications) || 0
      },

      recentBookings:
        formattedRecentBookings,

      recentNotifications:
        formattedRecentNotifications,

      popularRoutes:
        formattedPopularRoutes
    }
  });
});

/*
|--------------------------------------------------------------------------
| GET ALL BUSES
|--------------------------------------------------------------------------
|
| GET /api/admin/buses
|
*/

exports.getBuses = asyncHandler(async (req, res, next) => {
  const buses = await Bus.find()
    .sort({
      createdAt: -1
    });

  res.status(200).json({
    success: true,

    data: buses
      .map(formatBusForFrontend)
      .filter(Boolean)
  });
});

/*
|--------------------------------------------------------------------------
| CREATE BUS
|--------------------------------------------------------------------------
|
| POST /api/admin/buses
|
*/

exports.createBus = asyncHandler(async (req, res, next) => {
  const {
    operator,
    operatorName,
    busNumber,
    busType,
    registrationNumber,
    route,
    totalSeats,
    rows,
    columns,
    aisleAfter,
    seatLayout,
    seatConfiguration,
    amenities,
    boardingPoints,
    droppingPoints
  } = req.body;

  /*
   * Resolve operator name.
   */
  const resolvedOperatorName =
    operatorName ||
    operator;

  if (!resolvedOperatorName) {
    return res.status(400).json({
      success: false,
      message: 'Operator name is required'
    });
  }

  /*
   * Resolve seat configuration.
   */
  const seatSrc =
    seatConfiguration ||
    seatLayout ||
    {};

  const resolvedRows =
    Number(
      seatSrc.rows ||
      rows ||
      10
    );

  const resolvedColumns =
    Number(
      seatSrc.columns ||
      columns ||
      4
    );

  const resolvedAisleAfter =
    Number(
      seatSrc.aisleAfter ||
      aisleAfter ||
      2
    );

  const resolvedTotalSeats =
    Number(
      seatSrc.totalSeats ||
      totalSeats ||
      (
        resolvedRows *
        resolvedColumns
      )
    );

  if (
    !resolvedTotalSeats ||
    resolvedTotalSeats < 1
  ) {
    return res.status(400).json({
      success: false,
      message: 'Total seats must be a positive number'
    });
  }

  /*
   * Registration number.
   */
  const resolvedRegNumber =
    registrationNumber ||
    `REG-${(busNumber || '')
      .replace(/[^A-Z0-9]/gi, '')
      .toUpperCase()}-${Date.now()
      .toString()
      .slice(-6)}`;

  /*
   * Create bus data.
   */
  const busData = {
    operatorName:
      resolvedOperatorName,

    busNumber,

    busType,

    registrationNumber:
      resolvedRegNumber,

    seatConfiguration: {
      rows:
        resolvedRows,

      columns:
        resolvedColumns,

      aisleAfter:
        resolvedAisleAfter,

      totalSeats:
        resolvedTotalSeats
    },

    amenities:
      Array.isArray(amenities)
        ? amenities
        : [
            'WiFi',
            'USB Charging',
            'Water Bottle'
          ],

    boardingPoints:
      Array.isArray(boardingPoints)
        ? boardingPoints
        : route?.from
          ? [route.from]
          : [],

    droppingPoints:
      Array.isArray(droppingPoints)
        ? droppingPoints
        : route?.to
          ? [route.to]
          : [],

    isActive: true
  };

  try {
    const bus =
      await Bus.create(busData);

    res.status(201).json({
      success: true,

      message:
        'Bus created successfully',

      data:
        formatBusForFrontend(bus)
    });
  } catch (err) {
    /*
     * Validation error
     */
    if (err.name === 'ValidationError') {
      const messages =
        Object.values(err.errors)
          .map((e) => e.message);

      return res.status(400).json({
        success: false,
        message:
          messages.join('; ')
      });
    }

    /*
     * Duplicate key
     */
    if (err.code === 11000) {
      const field =
        Object.keys(
          err.keyValue || {}
        )[0] || 'field';

      return res.status(409).json({
        success: false,

        message:
          `A bus with this ${
            field === 'busNumber'
              ? 'bus number'
              : 'registration number'
          } already exists`
      });
    }

    throw err;
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE BUS
|--------------------------------------------------------------------------
|
| PATCH /api/admin/buses/:id
|
*/

exports.updateBus = asyncHandler(async (req, res, next) => {
  const {
    operator,
    operatorName,
    seatLayout,
    seatConfiguration,
    totalSeats,
    ...rest
  } = req.body;

  const updateFields = {
    ...rest
  };

  /*
   * Operator name
   */
  if (operator || operatorName) {
    updateFields.operatorName =
      operatorName ||
      operator;
  }

  /*
   * Seat configuration
   */
  if (
    seatLayout ||
    seatConfiguration ||
    totalSeats
  ) {
    const seatSrc =
      seatConfiguration ||
      seatLayout ||
      {};

    const existing =
      await Bus.findById(
        req.params.id
      ).lean();

    updateFields.seatConfiguration = {
      rows:
        Number(
          seatSrc.rows ||
          existing?.seatConfiguration?.rows ||
          10
        ),

      columns:
        Number(
          seatSrc.columns ||
          existing?.seatConfiguration?.columns ||
          4
        ),

      aisleAfter:
        Number(
          seatSrc.aisleAfter ||
          existing?.seatConfiguration?.aisleAfter ||
          2
        ),

      totalSeats:
        Number(
          seatSrc.totalSeats ||
          totalSeats ||
          existing?.seatConfiguration?.totalSeats ||
          40
        )
    };
  }

  const bus =
    await Bus.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    );

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.status(200).json({
    success: true,

    message:
      'Bus updated successfully',

    data:
      formatBusForFrontend(bus)
  });
});

/*
|--------------------------------------------------------------------------
| DELETE BUS
|--------------------------------------------------------------------------
|
| DELETE /api/admin/buses/:id
|
*/

exports.deleteBus = asyncHandler(async (req, res, next) => {
  const bus =
    await Bus.findByIdAndDelete(
      req.params.id
    );

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Bus deleted successfully'
  });
});

/*
|--------------------------------------------------------------------------
| GET ALL BOOKINGS
|--------------------------------------------------------------------------
|
| GET /api/admin/bookings
|
*/

exports.getBookings = asyncHandler(async (req, res, next) => {
  const {
    status
  } = req.query;

  const query = {};

  if (status) {
    query.bookingStatus =
      status;
  }

  const bookings =
    await Booking.find(query)
      .populate({
        path: 'userId',
        select: 'name email phone',
        options: {
          strictPopulate: false
        }
      })
      .populate({
        path: 'busId',
        select: 'busNumber operatorName',
        options: {
          strictPopulate: false
        }
      })
      .populate({
        path: 'scheduleId',
        select: 'travelDate departureTime',
        options: {
          strictPopulate: false
        }
      })
      .sort({
        createdAt: -1
      })
      .lean();

  const formattedBookings =
    bookings.map((b) => ({
      id:
        b?.bookingId ||
        b?._id ||
        null,

      passengerName:
        b?.passengerDetails?.name ||
        b?.userId?.name ||
        'Unknown Passenger',

      busNumber:
        b?.busId?.busNumber ||
        'Unknown Bus',

      seat:
        b?.seatNumber ||
        'N/A',

      date:
        b?.scheduleId?.travelDate
          ? new Date(
              b.scheduleId.travelDate
            )
              .toISOString()
              .split('T')[0]
          : 'N/A',

      amount:
        Number(b?.fare) || 0,

      status:
        b?.bookingStatus ||
        'unknown',

      smartSeatMonitoring:
        Boolean(
          b?.smartSeatMonitoring
        )
    }));

  res.status(200).json({
    success: true,
    data: formattedBookings
  });
});

/*
|--------------------------------------------------------------------------
| GET ALL PASSENGERS
|--------------------------------------------------------------------------
|
| GET /api/admin/passengers
|
*/

exports.getPassengers = asyncHandler(async (req, res, next) => {
  const passengers =
    await User.find({
      role: 'passenger'
    })
      .select('-password')
      .sort({
        createdAt: -1
      })
      .lean();

  const formattedPassengers =
    await Promise.all(
      passengers.map(
        async (p) => {
          const [
            bookingCount,
            activeBookingCount
          ] = await Promise.all([
            Booking.countDocuments({
              userId: p._id
            }),

            Booking.countDocuments({
              userId: p._id,
              bookingStatus: 'confirmed'
            })
          ]);

          return {
            id:
              p._id,

            name:
              p?.name ||
              'Unknown Passenger',

            email:
              p?.email ||
              '',

            phone:
              p?.phone ||
              '',

            totalBookings:
              bookingCount || 0,

            activeBookings:
              activeBookingCount || 0,

            smartSeatEnabled:
              true,

            createdAt:
              p?.createdAt ||
              null
          };
        }
      )
    );

  res.status(200).json({
    success: true,
    data: formattedPassengers
  });
});

/*
|--------------------------------------------------------------------------
| GET NOTIFICATIONS
|--------------------------------------------------------------------------
|
| GET /api/admin/notifications
|
*/

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const {
    type,
    read
  } = req.query;

  const query = {};

  if (type) {
    query.type = type;
  }

  if (read !== undefined) {
    query.read =
      read === 'true';
  }

  const notifications =
    await Notification.find(query)
      .populate({
        path: 'userId',
        select: 'name email',
        options: {
          strictPopulate: false
        }
      })
      .sort({
        createdAt: -1
      })
      .limit(50)
      .lean();

  /*
   * IMPORTANT:
   *
   * userId can be null.
   */
  const formattedNotifications =
    notifications.map((n) => {
      try {
        return {
          id:
            n?._id ||
            null,

          type:
            n?.type ||
            'general',

          title:
            n?.title ||
            '',

          recipient:
            (n?.userId && n.userId.name) ||
            (n?.userId && n.userId.email) ||
            'Unknown User',

          // For contact-form (type='system') notifications, expose sender
          // details from metadata so the admin can see who sent the message.
          senderName:  n?.metadata?.senderName  || null,
          senderEmail: n?.metadata?.senderEmail || null,
          senderPhone: n?.metadata?.senderPhone || null,
          subject:     n?.metadata?.subject     || null,

          message:
            n?.message ||
            '',

          read:
            Boolean(n?.read),

          time:
            n?.createdAt ||
            null
        };
      } catch (mapErr) {
        console.error(
          '[getNotifications] Failed to map notification',
          n?._id,
          mapErr.message
        );
        return {
          id: n?._id || null,
          type: n?.type || 'general',
          title: n?.title || '',
          recipient: 'Unknown User',
          message: n?.message || '',
          read: Boolean(n?.read),
          time: n?.createdAt || null
        };
      }
    });

  res.status(200).json({
    success: true,
    data: formattedNotifications
  });
});

/*
|--------------------------------------------------------------------------
| GET ANALYTICS
|--------------------------------------------------------------------------
|
| GET /api/admin/analytics
|
*/

exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const {
    period = 'month'
  } = req.query;

  let startDate;

  const now =
    new Date();

  switch (period) {
    case 'week':
      startDate =
        new Date(
          now.getTime() -
          7 *
            24 *
            60 *
            60 *
            1000
        );
      break;

    case 'month':
      startDate =
        new Date(
          now.getTime() -
          30 *
            24 *
            60 *
            60 *
            1000
        );
      break;

    case 'quarter':
      startDate =
        new Date(
          now.getTime() -
          90 *
            24 *
            60 *
            60 *
            1000
        );
      break;

    case 'year':
      startDate =
        new Date(
          now.getTime() -
          365 *
            24 *
            60 *
            60 *
            1000
        );
      break;

    default:
      startDate =
        new Date(
          now.getTime() -
          30 *
            24 *
            60 *
            60 *
            1000
        );
  }

  const [
    bookings,
    bookingsData,
    smartSeatData
  ] = await Promise.all([
    Booking.countDocuments({
      createdAt: {
        $gte: startDate
      }
    }),

    Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate
          }
        }
      },

      {
        $group: {
          _id: null,

          revenue: {
            $sum: {
              $ifNull: ['$fare', 0]
            }
          },

          seatChanges: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    '$metadata.seatChange',
                    true
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]),

    Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate
          },

          smartSeatMonitoring:
            true
        }
      },

      {
        $count:
          'smartSeatBookings'
      }
    ])
  ]);

  const totalRevenue =
    bookingsData[0]?.revenue ||
    0;

  const seatChanges =
    bookingsData[0]?.seatChanges ||
    0;

  const smartSeatBookings =
    smartSeatData[0]
      ?.smartSeatBookings ||
    0;

  /*
   * Passenger growth
   */
  const previousPeriodStart =
    new Date(
      startDate.getTime() -
      (
        now.getTime() -
        startDate.getTime()
      )
    );

  const [
    currentPassengers,
    previousPassengers
  ] = await Promise.all([
    User.countDocuments({
      role: 'passenger',

      createdAt: {
        $gte: startDate
      }
    }),

    User.countDocuments({
      role: 'passenger',

      createdAt: {
        $gte: previousPeriodStart,

        $lt: startDate
      }
    })
  ]);

  const passengerGrowth =
    previousPassengers > 0
      ? Math.round(
          (
            (
              currentPassengers -
              previousPassengers
            ) /
            previousPassengers
          ) *
            100
        )
      : 0;

  const smartSeatAdoption =
    bookings > 0
      ? Math.round(
          (
            smartSeatBookings /
            bookings
          ) *
            100
        )
      : 0;

  /*
   * Route performance
   */
  const routeData =
    await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate
          },

          routeId: {
            $ne: null
          }
        }
      },

      {
        $group: {
          _id: '$routeId',

          bookings: {
            $sum: 1
          },

          revenue: {
            $sum: {
              $ifNull: ['$fare', 0]
            }
          }
        }
      },

      {
        $sort: {
          bookings: -1
        }
      },

      {
        $limit: 5
      }
    ]);

  let routePerformance = [];

  try {
    routePerformance =
      await Route.populate(
        routeData,
        {
          path: '_id',
          model: 'Route'
        }
      );
  } catch (error) {
    console.error(
      'Analytics route population error:',
      error.message
    );

    routePerformance =
      routeData;
  }

  res.status(200).json({
    success: true,

    data: {
      revenue:
        totalRevenue,

      bookings:
        bookings || 0,

      seatChanges:
        seatChanges || 0,

      passengerGrowth:
        passengerGrowth || 0,

      smartSeatAdoption:
        smartSeatAdoption || 0,

      routePerformance:
        routePerformance
          .filter(Boolean)
          .map((r) => {
            const route =
              r?._id &&
              typeof r._id === 'object'
                ? r._id
                : null;

            return {
              from:
                route?.source ||
                'Unknown',

              to:
                route?.destination ||
                'Unknown',

              bookings:
                Number(r?.bookings) || 0,

              revenue:
                Number(r?.revenue) || 0
            };
          })
    }
  });
});

/*
|--------------------------------------------------------------------------
| GET SETTINGS
|--------------------------------------------------------------------------
|
| GET /api/admin/settings
|
*/

exports.getSettings = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,

    data: {
      siteName:
        'SmartSeat',

      supportEmail:
        'support@smartseat.com',

      supportPhone:
        '+91 1800-123-4567',

      enableSmartSeat:
        true,

      enableRecommendations:
        true,

      enableNotifications:
        true,

      maxSeatChanges:
        3,

      seatChangeCutoffHours:
        24
    }
  });
});

/*
|--------------------------------------------------------------------------
| UPDATE SETTINGS
|--------------------------------------------------------------------------
|
| PATCH /api/admin/settings
|
*/

exports.updateSettings = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,

    message:
      'Settings updated successfully',

    data:
      req.body
  });
});

/*
|--------------------------------------------------------------------------
| CREATE ROUTE
|--------------------------------------------------------------------------
|
| POST /api/admin/routes
|
*/

exports.createRoute = asyncHandler(async (req, res, next) => {
  const route =
    await Route.create(
      req.body
    );

  res.status(201).json({
    success: true,

    message:
      'Route created successfully',

    data:
      route
  });
});

/*
|--------------------------------------------------------------------------
| UPDATE ROUTE
|--------------------------------------------------------------------------
|
| PATCH /api/admin/routes/:id
|
*/

exports.updateRoute = asyncHandler(async (req, res, next) => {
  const route =
    await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.status(200).json({
    success: true,

    message:
      'Route updated successfully',

    data:
      route
  });
});

/*
|--------------------------------------------------------------------------
| DELETE ROUTE
|--------------------------------------------------------------------------
|
| DELETE /api/admin/routes/:id
|
*/

exports.deleteRoute = asyncHandler(async (req, res, next) => {
  const route =
    await Route.findByIdAndDelete(
      req.params.id
    );

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.status(200).json({
    success: true,

    message:
      'Route deleted successfully'
  });
});

/*
|--------------------------------------------------------------------------
| CREATE SCHEDULE
|--------------------------------------------------------------------------
|
| POST /api/admin/schedules
|
*/

exports.createSchedule = asyncHandler(async (req, res, next) => {
  const schedule =
    await Schedule.create(
      req.body
    );

  res.status(201).json({
    success: true,

    message:
      'Schedule created successfully',

    data:
      schedule
  });
});

/*
|--------------------------------------------------------------------------
| UPDATE SCHEDULE
|--------------------------------------------------------------------------
|
| PATCH /api/admin/schedules/:id
|
*/

exports.updateSchedule = asyncHandler(async (req, res, next) => {
  const schedule =
    await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.status(200).json({
    success: true,

    message:
      'Schedule updated successfully',

    data:
      schedule
  });
});

/*
|--------------------------------------------------------------------------
| DELETE SCHEDULE
|--------------------------------------------------------------------------
|
| DELETE /api/admin/schedules/:id
|
*/

exports.deleteSchedule = asyncHandler(async (req, res, next) => {
  const schedule =
    await Schedule.findByIdAndDelete(
      req.params.id
    );

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.status(200).json({
    success: true,

    message:
      'Schedule deleted successfully'
  });
});

/*
|--------------------------------------------------------------------------
| REPORT BUS DELAY
|--------------------------------------------------------------------------
|
| POST /api/admin/schedules/:id/delay
|
*/

exports.reportDelay = asyncHandler(async (req, res, next) => {
  const {
    id
  } = req.params;

  const {
    delayMinutes
  } = req.body;

  /*
   * Validate delay
   */
  if (
    typeof delayMinutes !== 'number' ||
    delayMinutes < 0 ||
    !Number.isFinite(delayMinutes)
  ) {
    return res.status(400).json({
      success: false,

      message:
        'delayMinutes must be a non-negative number'
    });
  }

  /*
   * Find schedule
   */
  const schedule =
    await Schedule.findById(id)
      .populate(
        'busId',
        'busNumber operatorName'
      )
      .populate(
        'routeId',
        'source destination'
      );

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  /*
   * Update delay
   */
  schedule.delayMinutes =
    delayMinutes;

  await schedule.save();

  /*
   * Delay cleared
   */
  if (delayMinutes === 0) {
    return res.status(200).json({
      success: true,

      message:
        'Schedule delay cleared',

      data: {
        scheduleId:
          id,

        delayMinutes:
          0
      }
    });
  }

  /*
   * Find affected bookings
   */
  const affectedBookings =
    await Booking.find({
      scheduleId: id,

      bookingStatus: {
        $in: [
          'confirmed',
          'pending'
        ]
      }
    })
      .select(
        'userId bookingId seatNumber'
      )
      .lean();

  if (
    affectedBookings.length === 0
  ) {
    return res.status(200).json({
      success: true,

      message:
        'Delay recorded. No passengers to notify.',

      data: {
        scheduleId:
          id,

        delayMinutes,

        notified:
          0
      }
    });
  }

  /*
   * Route information
   */
  const from =
    schedule.routeId?.source ||
    'Origin';

  const to =
    schedule.routeId?.destination ||
    'Destination';

  const busNumber =
    schedule.busId?.busNumber ||
    'Bus';

  /*
   * Calculate updated departure time.
   */
  let updatedDepartureText = '';

  if (schedule.departureTime) {
    const [
      hh,
      mm
    ] =
      schedule.departureTime
        .split(':')
        .map(Number);

    const totalMins =
      hh * 60 +
      mm +
      delayMinutes;

    const newHH =
      Math.floor(
        totalMins / 60
      ) % 24;

    const newMM =
      totalMins % 60;

    const period =
      newHH >= 12
        ? 'PM'
        : 'AM';

    const displayH =
      newHH % 12 ||
      12;

    updatedDepartureText =
      ` New departure: ${displayH}:${String(
        newMM
      ).padStart(2, '0')} ${period}.`;
  }

  /*
   * Notification content
   */
  const title =
    'Bus Delay Alert';

  const message =
    `Your SmartSeat bus (${busNumber}) from ${from} to ${to} is delayed by approximately ${delayMinutes} minute${
      delayMinutes !== 1
        ? 's'
        : ''
    }.${updatedDepartureText}`;

  /*
   * Existing notifications
   */
  const existingNotifs =
    await Notification.find({
      scheduleId: id,

      type: 'delay',

      'metadata.delayMinutes':
        delayMinutes,

      read: false
    })
      .select('userId')
      .lean();

  /*
   * Safely create Set.
   */
  const alreadyNotifiedUserIds =
    new Set(
      existingNotifs
        .filter(
          (n) =>
            n?.userId
        )
        .map(
          (n) =>
            n.userId.toString()
        )
    );

  /*
   * Create notifications.
   *
   * Skip bookings where userId is missing.
   */
  const notificationsToCreate =
    affectedBookings
      .filter(
        (b) =>
          b?.userId &&
          !alreadyNotifiedUserIds.has(
            b.userId.toString()
          )
      )
      .map((b) => ({
        userId:
          b.userId,

        type:
          'delay',

        category:
          'Delay',

        title,

        message,

        bookingId:
          b._id,

        scheduleId:
          schedule._id,

        metadata: {
          delayMinutes,

          busNumber,

          from,

          to,

          originalDepartureTime:
            schedule.departureTime,

          travelDate:
            schedule.travelDate
        }
      }));

  /*
   * Insert notifications.
   */
  let notified = 0;

  if (
    notificationsToCreate.length > 0
  ) {
    const created =
      await Notification.insertMany(
        notificationsToCreate
      );

    notified =
      created.length;

    /*
     * Socket.IO
     */
    if (global.socketIO) {
      created.forEach(
        (notif) => {
          if (!notif?.userId) {
            return;
          }

          global.socketIO
            .to(
              `user:${notif.userId}`
            )
            .emit(
              'notification:new',
              notif
            );
        }
      );
    }
  }

  /*
   * Final response
   */
  return res.status(200).json({
    success: true,

    message:
      `Delay recorded. ${notified} passenger${
        notified !== 1
          ? 's'
          : ''
      } notified.`,

    data: {
      scheduleId:
        id,

      delayMinutes,

      notified
    }
  });
});


/*
|--------------------------------------------------------------------------
| SUBMIT CONTACT MESSAGE
|--------------------------------------------------------------------------
|
| POST /api/contact   (public — no auth required)
|
| Creates a Notification document addressed to the admin so it appears
| in the Admin → Notifications log under type='system'.
|
| Because Notification.userId is required (ObjectId → User), we find the
| first admin user and use their _id as the recipient.  The sender's
| details are preserved in notification.metadata.
|
*/

exports.submitContact = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    subject,
    message
  } = req.body;

  /*
   * Validate required fields.
   */
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message are required'
    });
  }

  /*
   * Find the admin user to address the notification to.
   */
  const adminUser = await User.findOne({ role: 'admin' }).lean();

  if (!adminUser) {
    /*
     * No admin user in DB (edge case in dev/test).
     * Still accept the submission but skip persistence.
     */
    return res.status(200).json({
      success: true,
      message: 'Message received'
    });
  }

  /*
   * Build a meaningful title from the subject.
   */
  const subjectLabels = {
    booking:     'Booking Related',
    payment:     'Payment Issue',
    technical:   'Technical Support',
    feedback:    'Feedback',
    partnership: 'Partnership Inquiry',
    other:       'General Inquiry'
  };

  const title =
    `Contact: ${subjectLabels[subject] || subject || 'General Inquiry'} from ${name}`;

  await Notification.create({
    userId:   adminUser._id,
    type:     'system',
    category: 'System',
    title,
    message:  message.trim(),
    metadata: {
      senderName:  name,
      senderEmail: email,
      senderPhone: phone  || '',
      subject:     subject || 'other',
      source:      'contact_form'
    }
  });

  return res.status(200).json({
    success: true,
    message: 'Your message has been sent. We will get back to you within 24 hours.'
  });
});

/*
|--------------------------------------------------------------------------
| GET BUSES WITH SCHEDULE STATUS
|--------------------------------------------------------------------------
|
| This replaces the existing getBuses to include a hasSchedule flag so the
| Admin Buses page can warn about buses that are not yet searchable.
|
*/

exports.getBusesWithScheduleStatus = asyncHandler(async (req, res, next) => {
  const buses = await Bus.find().sort({ createdAt: -1 });

  /*
   * Find all busIds that have at least one Schedule document.
   */
  const busIdsWithSchedule = await Schedule.distinct('busId');

  const busIdSet = new Set(
    busIdsWithSchedule.map((id) => id.toString())
  );

  res.status(200).json({
    success: true,

    data: buses
      .map((bus) => {
        const formatted = formatBusForFrontend(bus);
        if (!formatted) return null;
        return {
          ...formatted,
          hasSchedule: busIdSet.has(bus._id.toString())
        };
      })
      .filter(Boolean)
  });
});
