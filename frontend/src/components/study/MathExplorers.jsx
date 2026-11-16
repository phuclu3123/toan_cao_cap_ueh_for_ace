import MatrixArithmeticMovie from './MatrixArithmeticMovie';
import TransposeMatrixMovie from './TransposeMatrixMovie';
import { CofactorMovie, LaplaceMovie, SarrusMovie, TriangleGallery } from './MatrixGeometryMovies';
import { InverseThreeMovie, RowOperationsMovie } from './MatrixFlowMovie';
import { DimensionsScene, ScalarScene, SystemMatrixScene, RankScene, RankCasesScene, IOScene, RateScene, ChainScene, ImplicitScene, PartialScene, SignChartScene, ExtremaScene, K51ExtremaScene, LagrangeScene, ODEProcessScene, IntegralScene, DynamicsScene, LectureParameterMovie } from './CourseScenes';
import { CramerLessonScene, GaussSystemScene, RankMinorsScene, RankParameterScene, AdjugateIdentitiesScene, MatrixEquationScene, IOCoefficientScene, IOTransactionsScene, IOInverseFlowsScene } from './ReviewedScenes';
import { ImplicitElasticityScene, PartialElasticityScene, DegenerateExtremaScene, BudgetConstraintScene } from './CalculusReviewScenes';
import '../../assets/styles/MathExplorers.css';

const scenes = {
 dimensions: () => <DimensionsScene />,
 scalar: () => <ScalarScene />,
 triangles: () => <TriangleGallery />,
 addition: () => <MatrixArithmeticMovie initialOperation="add" allowedOperations={['add','subtract']} />,
 product: () => <MatrixArithmeticMovie initialOperation="multiply" allowedOperations={['multiply']} />,
 transpose: () => <TransposeMatrixMovie />,
 laplace: () => <LaplaceMovie />,
 sarrus: () => <SarrusMovie />,
 'row-operations': () => <RowOperationsMovie />,
 inverse: () => <InverseThreeMovie />,
 cofactor: () => <CofactorMovie />,
 rank: () => <RankScene />,
 'system-matrix': () => <SystemMatrixScene />,
 homogeneous: () => <GaussSystemScene homogeneous />,
 'rank-cases': () => <RankCasesScene />,
 cramer: () => <CramerLessonScene />,
 'gauss-system': () => <GaussSystemScene />,
 'rank-minors': () => <RankMinorsScene />,
 'rank-parameter': () => <RankParameterScene />,
 'adjugate-identities': () => <AdjugateIdentitiesScene />,
 'matrix-equations': () => <MatrixEquationScene />,

 'io-coefficient': () => <IOCoefficientScene />,
 'parameter-cases': () => <LectureParameterMovie />,
 'io-table': () => <IOTransactionsScene />,
 'io-flows': () => <IOInverseFlowsScene />,
 'io-balance': () => <IOScene kind="balance" />,
 'io-demand': () => <IOScene kind="demand" />,
 'io-technology': () => <IOScene kind="technology" />,
 secant: () => <RateScene kind="secant" />,
 differential: () => <RateScene kind="differential" />,
 marginal: () => <RateScene kind="marginal" />,
 'average-marginal': () => <RateScene kind="average-marginal" />,
 elasticity: () => <RateScene kind="elasticity" />,
 'implicit-elasticity': () => <ImplicitElasticityScene />,
 'partial-elasticity': () => <PartialElasticityScene />,
 'degenerate-extrema': () => <DegenerateExtremaScene />,
 'budget-constraint': () => <BudgetConstraintScene />,
 chain: () => <ChainScene />,
 multichain: () => <ChainScene multiple />,
 implicit: () => <ImplicitScene />,
 partial: () => <PartialScene />,
 'total-differential': () => <PartialScene kind="total-differential" />,
 cobb: () => <PartialScene kind="cobb" />,
 'sign-chart': () => <SignChartScene />,
 'k51-extrema': () => <K51ExtremaScene />,
 stationary: () => <ExtremaScene kind="stationary" />,
 hessian: () => <ExtremaScene kind="hessian" />,
 'global-optimum': () => <ExtremaScene kind="global-optimum" />,
 lagrange: () => <LagrangeScene kind="lagrange" />,
 'bordered-hessian': () => <LagrangeScene kind="bordered-hessian" />,
 'cost-optimum': () => <LagrangeScene kind="cost-optimum" />,
 integral: () => <IntegralScene />,
 'ode-definition': () => <ODEProcessScene kind="ode-definition" />,
 separable: () => <ODEProcessScene kind="separable" />,
 'integrating-factor': () => <ODEProcessScene kind="integrating-factor" />,
 'integration-parts': () => <ODEProcessScene kind="integration-parts" />,
 growth: () => <DynamicsScene kind="growth" />,
 'bounded-growth': () => <DynamicsScene kind="bounded-growth" />,
 exchange: () => <DynamicsScene kind="exchange" />,
 solow: () => <DynamicsScene kind="solow" />,
};
// No topic-wide fallback: missing mappings must be found during acceptance.
export default function MathExplorers({ scene }) {
 const render = scenes[scene];
 if (!render) throw new Error(`Unknown study scene: ${scene}`);
 return <div className="study-scene-host" data-scene-id={scene}>{render()}</div>;
}
